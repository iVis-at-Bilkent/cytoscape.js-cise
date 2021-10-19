/**
A generic continuous layout class. This class will be inherited.
If `packComponents` is `true`, it will run the algorithm for each connected component of the graph. Then uses cytoscape.js-layout-utilities to layout the components.
*/

const assign = require('../../assign');
const defaults = require('./defaults');
const makeBoundingBox = require('./make-bb');
const { setInitialPositionState, refreshPositions, getNodePositionData } = require('./position');
const { multitick } = require('./tick');
const { DisjointSets } = require('./DisjointSets');

class ContinuousLayout {
  constructor(options) {
    let o = this.options = assign({}, defaults, options);

    let s = this.state = assign({}, o, {
      layout: this,
      nodes: o.eles.nodes(),
      edges: o.eles.edges(),
      tickIndex: 0,
      firstUpdate: true
    });

    s.animateEnd = o.animate && o.animate === 'end';
    s.animateContinuously = o.animate && !s.animateEnd;
    // store component center (in this case it's whole graph)
    let boundingBox = s.eles.boundingBox();
    s.componentCenter = {x: boundingBox.x1 + boundingBox.w / 2, y: boundingBox.y1 + boundingBox.h / 2};

    // If clusters option is a function, change it to array format
    // and use it in that format afterwards
    if (typeof s.clusters === "function") {
      let cIDs = [];
      let temp = [];

      for(let i = 0; i < s.nodes.length; i++){
          let cID = s.clusters(s.nodes[i]);
          if (cID > 0 && cID !== null && cID !== undefined ) {
              let index = cIDs.indexOf( cID );
              if (index > -1) {
                  temp[index].push(s.nodes[i].data('id'));
              }
              else{
                  cIDs.push(cID);
                  temp.push([s.nodes[i].data('id')]);
              }
          }
      }
      s.clusters = temp;
    }

    if (o.packComponents) {
      if (this.state.clusters == null || this.state.clusters == undefined) {
        throw "ERROR: Cluster information is invalid/undefined/null. Please create the 'clusters' variable as defined in the documentation";
      }
      if (this.state.nodes == null && this.state.nodes == undefined || this.state.nodes.length == 0) {
        throw "ERROR: Node information is invalid/undefined/null or simply empty. Please make sure nodes are passed properly. Can't layout an empty graph";
      }
      
      let components = this.getDisjointSets(o.cy.$(), this.state.clusters);

      // if there is only one component, then no need to separate states and apply component packing
      if (components.length > 1) {
        this.states = [];
        for (let i = 0; i < components.length; i++) {
          const currComp = components[i];
          let state = assign({}, o, { layout: this, nodes: currComp.nodes(), edges: currComp.edges(), tickIndex: 0, firstUpdate: true });
          state.animateEnd = o.animate && o.animate === 'end';
          state.animateContinuously = o.animate && !state.animateEnd;
          state.clusters = this.getRelevantClusters4Nodes(state.clusters, state.nodes);
          let boundingBox = currComp.boundingBox();
          state.componentCenter = {x: boundingBox.x1 + boundingBox.w / 2, y: boundingBox.y1 + boundingBox.h / 2}; // store component center
          this.states.push(state);
        }
      }
    }
  }

  /** clusters and components must be united
   * @param  {} eles cytoscape.js collection for all the elements
   * @param  {} clusters array of array of element ids or a function which takes cytoscape.js as param and return the cluster id of the element
   */
  getDisjointSets(eles, clusters) {
    const id2idx = {};
    const nodes = eles.nodes();
    const edges = eles.edges();
    for (let i = 0; i < nodes.length; i++) {
      id2idx[nodes[i].id()] = i;
    }

    // use union find data structure to find connected components in cy
    const disjointSets = new DisjointSets(nodes.length);
    for (let i = 0; i < edges.length; i++) {
      const x = id2idx[edges[i].source().id()];
      const y = id2idx[edges[i].target().id()];
      disjointSets.unite(x, y);
    }

    // unite the clusters
    for (let i = 0; i < clusters.length; i++) {
      for (let j = 0; j < clusters[i].length - 1; j++) {
        const x = id2idx[clusters[i][j]];
        const y = id2idx[clusters[i][j + 1]];
        disjointSets.unite(x, y);
      }
    }

    const unions = {};
    for (let i = 0; i < nodes.length; i++) {
      const un = disjointSets.findSet(id2idx[nodes[i].id()]);
      const nodeAndEdges = nodes[i].connectedEdges().union(nodes[i]);
      if (unions[un]) {
        unions[un] = unions[un].union(nodeAndEdges);
      } else {
        unions[un] = nodeAndEdges;
      }
    }
    return Object.values(unions);
  }

  getRelevantClusters4Nodes(clusters, nodes) {
    const nodeDict = {};
    for (let i = 0; i < nodes.length; i++) {
      nodeDict[nodes[i].id()] = true;
    }
    let r = [];
    if (typeof clusters == 'function') {
      let clusterObj = {};
      for (let i = 0; i < nodes.length; i++) {
        const nodeId = nodes[i].id();
        const clusterId = clusters(nodes[i]);
        if (!clusterObj[clusterId]) {
          clusterObj[clusterId] = [nodeId];
        } else {
          clusterObj[clusterId].push(nodeId);
        }
      }
      r = Object.values(clusterObj);
    } else {
      for (let i = 0; i < clusters.length; i++) {
        const cluster = [];
        for (let j = 0; j < clusters[i].length; j++) {
          const currElem = clusters[i][j];
          if (nodeDict[currElem]) {
            cluster.push(currElem);
          }
        }
        if (cluster.length > 0) {
          r.push(cluster);
        }
      }
    }
    return r;
  }

  // relocates state(component) to originalCenter
  relocateComponent(state) {
    let minXCoord = Number.POSITIVE_INFINITY;
    let maxXCoord = Number.NEGATIVE_INFINITY;
    let minYCoord = Number.POSITIVE_INFINITY;
    let maxYCoord = Number.NEGATIVE_INFINITY;
    let nodes = state.nodes;
    // calculate current bounding box of component
    for (let i = 0; i < nodes.length; i++) {
      let cyNode = nodes[i];
      let currentPos = this.getScratch(cyNode, state.name);
      let nodeBB = cyNode.boundingBox();
      let leftX = currentPos.x - nodeBB.w / 2;
      let rightX = currentPos.x + nodeBB.w / 2;
      let topY = currentPos.y - nodeBB.h / 2;
      let bottomY = currentPos.y + nodeBB.h / 2;

      if (leftX < minXCoord)
        minXCoord = leftX;
      if (rightX > maxXCoord)
        maxXCoord = rightX;
      if (topY < minYCoord)
        minYCoord = topY;
      if (bottomY > maxYCoord)
        maxYCoord = bottomY;
    }
    // find difference between current and original center
    let diffOnX = state.componentCenter.x - (maxXCoord + minXCoord) / 2;
    let diffOnY = state.componentCenter.y - (maxYCoord + minYCoord) / 2;
    // move component to original center
    state.nodes.forEach(n => {
      let currentPos = this.getScratch(n, state.name);
      currentPos.x = currentPos.x + diffOnX;
      currentPos.y = currentPos.y + diffOnY;
    });
  };

  getScratch(el, name) {
    let scratch = el.scratch(name);

    if (!scratch) {
      scratch = {};

      el.scratch(name, scratch);
    }
    return scratch;
  }

  // s is a state
  run4state(s) {
    let l = this;

    s.tickIndex = 0;
    s.firstUpdate = true;
    s.startTime = Date.now();
    s.running = true;

    s.currentBoundingBox = makeBoundingBox(s.boundingBox, s.cy);

    if (s.ready) { l.one('ready', s.ready); }
    if (s.stop) { l.one('stop', s.stop); }

    for (let i = 0; i < s.nodes.length; i++) {
      setInitialPositionState(s.nodes[i], s);
    }

    this.prerun(s);

    if (s.animateContinuously) {
      let ungrabify = node => {
        if (!s.ungrabifyWhileSimulating) { return; }

        let grabbable = getNodePositionData(node, s).grabbable = node.grabbable();

        if (grabbable) {
          node.ungrabify();
        }
      };

      let regrabify = node => {
        if (!s.ungrabifyWhileSimulating) { return; }

        let grabbable = getNodePositionData(node, s).grabbable;

        if (grabbable) {
          node.grabify();
        }
      };

      let updateGrabState = node => getNodePositionData(node, s).grabbed = node.grabbed();

      let onGrab = function ({ target }) {
        updateGrabState(target);
      };

      let onFree = onGrab;

      let onDrag = function ({ target }) {
        let p = getNodePositionData(target, s);
        let tp = target.position();

        p.x = tp.x;
        p.y = tp.y;
      };

      let listenToGrab = node => {
        node.on('grab', onGrab);
        node.on('free', onFree);
        node.on('drag', onDrag);
      };

      let unlistenToGrab = node => {
        node.removeListener('grab', onGrab);
        node.removeListener('free', onFree);
        node.removeListener('drag', onDrag);
      };

      let fit = () => {
        if (s.fit && s.animateContinuously) {
          s.cy.fit(s.padding);
        }
      };

      let onNotDone = () => {
        refreshPositions(s.nodes, s);
        fit();

        requestAnimationFrame(frame);
      };

      let frame = function () {
        multitick(s, onNotDone, onDone);
      };

      let onDone = () => {
        refreshPositions(s.nodes, s);
        fit();

        s.nodes.forEach(n => {
          regrabify(n);
          unlistenToGrab(n);
        });

        s.running = false;

        l.emit('layoutstop');
      };

      l.emit('layoutstart');

      s.nodes.forEach(n => {
        ungrabify(n);
        listenToGrab(n);
      });

      frame(); // kick off
    } else {
      let done = false;
      let onNotDone = () => { };
      let onDone = () => done = true;

      while (!done) {
        multitick(s, onNotDone, onDone);
      }
      // if there is no packing
      if (!this.states) {
        this.relocateComponent(s);
        s.nodes.layoutPositions(this, s, function (node) {
          let pd = getNodePositionData(node, s);
          return { x: pd.x, y: pd.y };
        });
      }
    }
    l.postrun(s);
    return this; // chaining
  }

  run() {
    if (this.states) {
      for (let i = 0; i < this.states.length; i++) {
        this.run4state(this.states[i]);
        this.relocateComponent(this.states[i]);
      }
      this.setShifts4PackingComponents(this.states);

    } else {
      this.run4state(this.state);
    }
  }

  stop() {
    this.state.running = false;
    return this; // chaining
  }

  destroy() {
    return this; // chaining
  }

  // use this.state and shift clusters based
  setShifts4PackingComponents(states) {
    const cy = this.options.cy;
    if (!cy.layoutUtilities || !this.options.packComponents) {
      return null;
    }

    let components = [];
    for (let i = 0; i < states.length; i++) {
      let nodes = [];
      for (let j = 0; j < states[i].nodes.length; j++) {
        const currNode = states[i].nodes[j];
        let pd = getNodePositionData(currNode, states[i]);
        const bb = currNode.boundingBox();
        nodes.push({ x: pd.x - bb.w / 2, y: pd.y - bb.h / 2, width: bb.w, height: bb.h });
      }
      let edges = [];
      for (let j = 0; j < states[i].edges.length; j++) {
        const currEdge = states[i].edges[j];
        // use source and target node positions in scratch as edge ends, because edge ends are not updated yet
        let sourcePos = getNodePositionData(currEdge.source(), states[i]);
        let targetPos = getNodePositionData(currEdge.target(), states[i]);
        edges.push({ startX: sourcePos.x, startY: sourcePos.y, endX: targetPos.x, endY: targetPos.y });
      }
      components.push({ nodes: nodes, edges: edges });
    }

    let layUtil = cy.layoutUtilities('get');
    if (!layUtil) {
      layUtil = cy.layoutUtilities();
    }
    const shifts = layUtil.packComponents(components, this.options.randomize).shifts;
    let node2shift = {};
    for (let i = 0; i < states.length; i++) {
      for (let j = 0; j < states[i].nodes.length; j++) {
        node2shift[states[i].nodes[j].id()] = { x: shifts[i].dx, y: shifts[i].dy };
      }
    }
    // `layoutPositions` should be called only once and it should be called with all the elements
    // 'cuz will fit to calling element set
    states[0].eles.layoutPositions(this, states[0], function (node) {
      let pd = getNodePositionData(node, states[0]);
      const id = node.id();
      return { x: pd.x + node2shift[id].x, y: pd.y + node2shift[id].y };
    });
  }
}

module.exports = ContinuousLayout;
