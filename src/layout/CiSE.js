
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

  CiSEConstants.DEFAULT_NODE_SEPARATION = options.DEFAULT_NODE_SEPARATION;
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

    // TODO What does these methods do really?
    //This method updates whether this graph is connected or not
    root.updateConnected();
    // This method calculates and returns the estimated size of this graph
    root.calcEstimatedSize();

    ciseLayout.calcNoOfChildrenForAllNodes();

    ciseLayout.doStep1();
    ciseLayout.doStep2();

    //root.setEstimatedSize(root.getBiggerDimension()); TODO Layout-base
  }

  // run this each iteraction
  tick(){
    let self = this;
    let state = this.state;
    let isDone = true;

    state.nodes.forEach( n => {
      let s = this.getScratch(n);

      let location = self.idToLNode[n.data('id')].getLocation();
      s.x = location.x;
      s.y = location.y;
    });

    return isDone;
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
