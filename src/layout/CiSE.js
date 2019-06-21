/**
 * This class builds the required connection between CiSE elements and Cytoscape extension elements
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

let CiSELayout = require('../CiSE/CiSELayout');
let CiSEConstants = require('../CiSE/CiSEConstants');
let FDLayoutConstants = require('avsdf-base').layoutBase.FDLayoutConstants;

const ContinuousLayout = require('./continuous-base');
const defaults = ContinuousLayout.defaults;
const assign = require('../assign');
const isFn = fn => typeof fn === 'function';

const optFn = ( opt, ele ) => {
  if( isFn( opt ) ){
    return opt( ele );
  } else {
    return opt;
  }
};

class Layout extends ContinuousLayout {
  constructor( options ){
    super( assign( {}, defaults, options ) );

    //Changing CiSEConstants if there is a particular option defined in 'options' part of Layout call
    if(options.nodeSeparation !== null && options.nodeSeparation !== undefined)
      CiSEConstants.DEFAULT_NODE_SEPARATION = options.nodeSeparation;
    else
      CiSEConstants.DEFAULT_NODE_SEPARATION = FDLayoutConstants.DEFAULT_EDGE_LENGTH / 4;

    if(options.idealInterClusterEdgeLengthCoefficient !== null &&
        options.idealInterClusterEdgeLengthCoefficient !== undefined)
      CiSEConstants.DEFAULT_IDEAL_INTER_CLUSTER_EDGE_LENGTH_COEFF = options.idealInterClusterEdgeLengthCoefficient;
    else
      CiSEConstants.DEFAULT_IDEAL_INTER_CLUSTER_EDGE_LENGTH_COEFF = 1.4;

    if(options.allowNodesInsideCircle !== null && options.allowNodesInsideCircle !== undefined)
      CiSEConstants.DEFAULT_ALLOW_NODES_INSIDE_CIRCLE = options.allowNodesInsideCircle;
    else
      CiSEConstants.DEFAULT_ALLOW_NODES_INSIDE_CIRCLE = false;

    if(options.maxRatioOfNodesInsideCircle !== null && options.maxRatioOfNodesInsideCircle !== undefined)
      CiSEConstants.DEFAULT_MAX_RATIO_OF_NODES_INSIDE_CIRCLE = options.maxRatioOfNodesInsideCircle;
    else
      CiSEConstants.DEFAULT_MAX_RATIO_OF_NODES_INSIDE_CIRCLE = 0.1;

    if(options.springCoeff !== null && options.springCoeff !== undefined)
      CiSEConstants.DEFAULT_SPRING_STRENGTH = options.springCoeff;
    else
      CiSEConstants.DEFAULT_SPRING_STRENGTH = 1.5 * FDLayoutConstants.DEFAULT_SPRING_STRENGTH;

    if (options.nodeRepulsion != null)
      CiSEConstants.DEFAULT_REPULSION_STRENGTH = FDLayoutConstants.DEFAULT_REPULSION_STRENGTH = options.nodeRepulsion;

    if (options.gravity != null)
      CiSEConstants.DEFAULT_GRAVITY_STRENGTH = FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH = options.gravity;

    if (options.gravityRange != null)
      CiSEConstants.DEFAULT_GRAVITY_RANGE_FACTOR = FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR = options.gravityRange;

    if(options.maxRatioOfNodesInsideCircle !== null && options.maxRatioOfNodesInsideCircle !== undefined)
      CiSEConstants.DEFAULT_MAX_RATIO_OF_NODES_INSIDE_CIRCLE = options.maxRatioOfNodesInsideCircle;
    else
      CiSEConstants.DEFAULT_MAX_RATIO_OF_NODES_INSIDE_CIRCLE = 0.1;
  }

  prerun(){
    let state = this.state;

    //Get the graph information from Cytoscape
    let clusters = [[]];
    if( this.options.clusters !== null && this.options.clusters !== undefined)
      clusters = this.options.clusters;
    let nodes = state.nodes;
    let edges = state.edges;

    //Initialize CiSE elements
    let ciseLayout = this.ciseLayout = new CiSELayout();
    let graphManager = this.graphManager = ciseLayout.newGraphManager();
    let root = this.root = graphManager.addRoot();

    // Construct the GraphManager according to the graph from Cytoscape
    this.idToLNode = ciseLayout.convertToClusteredGraph(nodes,edges,clusters);

    //This method updates whether this graph is connected or not
    root.updateConnected();
    // This method calculates and returns the estimated size of this graph
    root.calcEstimatedSize();
    ciseLayout.calcNoOfChildrenForAllNodes();

    ciseLayout.doStep1();
    ciseLayout.doStep2();

    root.updateBounds(true);
    root.estimatedSize = Math.max(root.right - root.left, root.bottom - root.top);
    ciseLayout.prepareCirclesForReversal();
    ciseLayout.calcIdealEdgeLengths(false);

    // ------------------------------------------
    // The variables to maintain the spring steps
    // ------------------------------------------
    // Index is there to iterate over steps
    this.initializerIndex = 0;

    // If the whole algorithm is finished
    this.isDone = false;

    // If the current step is finished
    this.isStepDone = false;

    // when to change to next step
    this.timeToSwitchNextStep = true;
  }

  // run this each iteraction
  tick(){
    // Getting References
    let self = this;
    let state = this.state;

    // Update Each Node Locations
    state.nodes.forEach( n => {
      let s = this.getScratch(n);

      let location = self.idToLNode[n.data('id')];
      s.x = location.getCenterX();
      s.y = location.getCenterY();
    });

    if(this.timeToSwitchNextStep){
      switch ( this.initializerIndex ) {
        case 0:
          this.ciseLayout.step5Init();
          break;
        case 1:
          this.ciseLayout.step3Init();
          break;
        case 2:
          this.ciseLayout.step5Init();
          break;
        case 3:
          this.ciseLayout.step4Init();
          break;
        case 4:
          this.ciseLayout.findAndMoveInnerNodes();
          this.ciseLayout.calcIdealEdgeLengths(true);
          this.ciseLayout.step5Init();
          break;
      }

      this.initializerIndex++;
      this.ciseLayout.iterations = 0;
      this.ciseLayout.totalDisplacement = 1000;
      this.timeToSwitchNextStep = false;
    }

    // Run one spring iteration
    this.isStepDone = this.ciseLayout.runSpringEmbedderTick();

    if( this.isStepDone && this.initializerIndex < 5) {
      this.timeToSwitchNextStep = true;
    }

    if( this.isStepDone && this.timeToSwitchNextStep === false) {
      this.isDone = true;
    }

    return this.isDone;
  }

  // run this function after the layout is done ticking
  postrun(){

  }

  // clean up any object refs that could prevent garbage collection, etc.
  destroy(){
    super.destroy();

    return this;
  }
}

module.exports = Layout;
