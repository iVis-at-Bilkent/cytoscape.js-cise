// general default options for force-directed layout

module.exports = Object.freeze({
  animate: false, // whether to show the layout as it's running; special 'end' value makes the layout animate like a discrete layout
  refresh: 10, // number of ticks per frame; higher is faster but more jerky
  maxIterations: 2500, // max iterations before the layout will bail out
  maxSimulationTime: 5000, // max length in ms to run the layout
  animationDuration: undefined, // animation duration used for animate:'end'
  animationEasing: undefined,  // Easing for animate:'end' 
  ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
  fit: true, // on every layout reposition of nodes, fit the viewport
  padding: 30, // padding around the simulation
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  nodeDimensionsIncludeLabels: false, // whether to include labels in node dimensions.

  // positioning options
  randomize: true, // use random node positions at beginning of layout
  packComponents: false,  // whether to pack components of the graph, if set to true, you should import cytoscape.js-layout-utilities  
  
  // CiSE specific options
  nodeSeparation: 12.5, // separation amount between nodes in a cluster
  idealInterClusterEdgeLengthCoefficient: 1.4,  // inter-cluster edge length factor 
  allowNodesInsideCircle: false, // whether to pull on-circle nodes inside of the circle
  maxRatioOfNodesInsideCircle: 0.1, // max percentage of the nodes in a circle that can move inside the circle
  springCoeff: edge => 0.45,  // lower values give looser springs, higher values give tighter springs
  nodeRepulsion: node => 4500,  // node repulsion (non overlapping) multiplier
  gravity: 0.25,  // gravity force (constant)
  gravityRange: 3.8,  // gravity range (constant)
  
  // layout event callbacks
  ready: function () { }, // on layoutready
  stop: function () { }, // on layoutstop
  //
  // infinite layout options
  infinite: false // overrides all other options for a forces-all-the-time mode  
});
