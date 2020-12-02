/**
A generic continuous layout class. This class will be inherited.
If `packComponents` is `true`, it will run the algorithm for each connected component of the graph. Then uses cytoscape.js-layout-utilities to layout the components.
*/

const assign = require('../../assign');
const defaults = require('./defaults');
const makeBoundingBox = require('./make-bb');
const { setInitialPositionState, refreshPositions, getNodePositionData } = require('./position');
const { multitick } = require('./tick');

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

    if (o.packComponents) {
      if (this.state.clusters == null || this.state.clusters == undefined) {
        throw "ERROR: Cluster information is invalid/undefined/null. Please create the 'clusters' variable as defined in the documentation";
      }
      if (this.state.nodes == null && this.state.nodes == undefined || this.state.nodes.length == 0) {
        throw "ERROR: Node information is invalid/undefined/null or simply empty. Please make sure nodes are passed properly. Can't layout an empty graph";
      }

      this.states = [];
      let components = o.cy.$().components();
      components = this.mergeComponentsIfNeeded(components, this.state.clusters);
      for (let i = 0; i < components.length; i++) {
        const currComp = components[i];
        let state = assign({}, o, { layout: this, nodes: currComp.nodes(), edges: currComp.edges(), tickIndex: 0, firstUpdate: true });
        state.animateEnd = o.animate && o.animate === 'end';
        state.animateContinuously = o.animate && !state.animateEnd;
        state.clusters = this.getRelevantClusters4Nodes(state.clusters, state.nodes);
        this.states.push(state);
      }
    }
  }

  /** If a cluster spans multiple components, merge them
   * @param  {} components is an array of cytoscape.js collections
   * @param  {} clusters array of array of element ids or a function which takes cytoscape.js as param and return the cluster id of the element
   */
  mergeComponentsIfNeeded(components, clusters) {
    let cluster2comp = {};

    if (typeof clusters == 'function') {
      const comp2cluster = {};
      for (let i = 0; i < components.length; i++) {
        comp2cluster[i] = {};
        for (let j = 0; j < components[i].length; j++) {
          const clusterId = clusters(components[i][j]);
          comp2cluster[i][clusterId] = true;
        }
      }
      for (let comp in comp2cluster) {
        for (let cluster in comp2cluster[comp]) {
          if (cluster2comp[cluster]) {
            cluster2comp[cluster][comp] = true;
          } else {
            const obj = {};
            obj[comp] = true;
            cluster2comp[cluster] = obj;
          }
        }
      }
    } else {
      for (let i = 0; i < clusters.length; i++) {
        for (let j = 0; j < clusters[i].length; j++) {
          const compIdx = components.findIndex(x => x.$id(clusters[i][j]).length > 0);
          if (cluster2comp[i]) {
            cluster2comp[i][compIdx] = true;
          } else {
            const obj = {};
            obj[compIdx] = true;
            cluster2comp[i] = obj;
          }
        }
      }
    }

    const newComps = []
    const clusteredComponents = {};
    for (let k in cluster2comp) {
      const comps = Object.keys(cluster2comp[k]);
      if (comps.length < 2) {
        continue;
      }
      let mergedComp = this.options.cy.collection();
      for (let i = 0; i < comps.length; i++) {
        if (!clusteredComponents[comps[i]]) {
          mergedComp = mergedComp.union(components[comps[i]]);
          clusteredComponents[comps[i]] = true;
        }
      }
      if (mergedComp.length > 0) {
        newComps.push(mergedComp);
      }
    }

    for (let i = 0; i < components.length; i++) {
      if (!clusteredComponents[i]) {
        newComps.push(components[i]);
      }
    }
    return newComps;
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
        nodes.push({ x: pd.x, y: pd.y, width: bb.w, height: bb.h });
      }
      let edges = [];
      for (let j = 0; j < states[i].edges.length; j++) {
        const currEdge = states[i].edges[j];
        let sourceEndpoint = currEdge.sourceEndpoint();
        let targetEndpoint = currEdge.targetEndpoint();
        edges.push({ startX: sourceEndpoint.x, startY: sourceEndpoint.y, endX: targetEndpoint.x, endY: targetEndpoint.y });
      }
      components.push({ nodes: nodes, edges: edges });
    }

    let layUtil = cy.layoutUtilities('get');
    if (!layUtil) {
      layUtil = cy.layoutUtilities({ desiredAspectRatio: cy.width() / cy.height() });
    }
    const shifts = layUtil.packComponents(components).shifts;
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

