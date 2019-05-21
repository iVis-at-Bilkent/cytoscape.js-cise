
let CiSELayout = require('../CiSE/CiSELayout');
let CiSEConstants = require('../CiSE/CiSEConstants');

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

    this.defaultSettings = [ CiSEConstants.DEFAULT_SPRING_STRENGTH,
                             CiSEConstants.DEFAULT_NODE_SEPARATION,
                             CiSEConstants.DEFAULT_IDEAL_INTER_CLUSTER_EDGE_LENGTH_COEFF,
                             CiSEConstants.DEFAULT_ALLOW_NODES_INSIDE_CIRCLE,
                             CiSEConstants.DEFAULT_MAX_RATIO_OF_NODES_INSIDE_CIRCLE
    ];

    //Changing CiSEConstants if there is a particular option defined in 'options'
    if(options.DEFAULT_SPRING_STRENGTH !== null && options.DEFAULT_SPRING_STRENGTH !== undefined)
      CiSEConstants.DEFAULT_SPRING_STRENGTH = options.DEFAULT_SPRING_STRENGTH;
    else
      CiSEConstants.DEFAULT_SPRING_STRENGTH = this.defaultSettings[0];

    if(options.DEFAULT_NODE_SEPARATION !== null && options.DEFAULT_NODE_SEPARATION !== undefined)
      CiSEConstants.DEFAULT_NODE_SEPARATION = options.DEFAULT_NODE_SEPARATION;
    else
      CiSEConstants.DEFAULT_NODE_SEPARATION = this.defaultSettings[1];

    if(options.DEFAULT_IDEAL_INTER_CLUSTER_EDGE_LENGTH_COEFF !== null &&
      options.DEFAULT_IDEAL_INTER_CLUSTER_EDGE_LENGTH_COEFF !== undefined)
      CiSEConstants.DEFAULT_IDEAL_INTER_CLUSTER_EDGE_LENGTH_COEFF = options.DEFAULT_IDEAL_INTER_CLUSTER_EDGE_LENGTH_COEFF;
    else
      CiSEConstants.DEFAULT_IDEAL_INTER_CLUSTER_EDGE_LENGTH_COEFF = this.defaultSettings[2];

    if(options.DEFAULT_ALLOW_NODES_INSIDE_CIRCLE !== null && options.DEFAULT_ALLOW_NODES_INSIDE_CIRCLE !== undefined)
      CiSEConstants.DEFAULT_ALLOW_NODES_INSIDE_CIRCLE = options.DEFAULT_ALLOW_NODES_INSIDE_CIRCLE;
    else
      CiSEConstants.DEFAULT_ALLOW_NODES_INSIDE_CIRCLE = this.defaultSettings[3];

    if(options.DEFAULT_MAX_RATIO_OF_NODES_INSIDE_CIRCLE !== null && options.DEFAULT_MAX_RATIO_OF_NODES_INSIDE_CIRCLE !== undefined)
      CiSEConstants.DEFAULT_MAX_RATIO_OF_NODES_INSIDE_CIRCLE = options.DEFAULT_MAX_RATIO_OF_NODES_INSIDE_CIRCLE;
    else
      CiSEConstants.DEFAULT_MAX_RATIO_OF_NODES_INSIDE_CIRCLE = this.defaultSettings[4];

    // This is for letting CiSELayout to know if it is going to be animated
    CiSEConstants.INCREMENTAL = this.state.animateEnd;
  }

  prerun(){
    let state = this.state;

    //Get the graph information from Cytoscape
    let clusters = this.options.clusters; //TODO take cluster as a function as well?
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

    // TODO Layout-base -- root.setEstimatedSize(root.getBiggerDimension());
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
      console.log('# of total iterations done: ' + this.ciseLayout.iterations);
      this.timeToSwitchNextStep = true;
    }

    if( this.isStepDone && this.timeToSwitchNextStep === false) {
      console.log('# of total iterations done: ' + this.ciseLayout.iterations);
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
