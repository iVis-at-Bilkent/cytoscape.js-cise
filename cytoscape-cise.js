(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("avsdf-base"), require("cose-base"));
	else if(typeof define === 'function' && define.amd)
		define(["avsdf-base", "cose-base"], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeCise"] = factory(require("avsdf-base"), require("cose-base"));
	else
		root["cytoscapeCise"] = factory(root["avsdfBase"], root["coseBase"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_3__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 13);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * This class maintains the constants used by CiSE layout.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

var FDLayoutConstants = __webpack_require__(0).layoutBase.FDLayoutConstants;

function CiSEConstants() {}

for (var prop in FDLayoutConstants) {
    CiSEConstants[prop] = FDLayoutConstants[prop];
}

// -----------------------------------------------------------------------------
// Section: CiSE layout user options
// -----------------------------------------------------------------------------

CiSEConstants.DEFAULT_SPRING_STRENGTH = 1.5 * FDLayoutConstants.DEFAULT_SPRING_STRENGTH;

// Amount of separation of nodes on the associated circle
CiSEConstants.DEFAULT_NODE_SEPARATION = FDLayoutConstants.DEFAULT_EDGE_LENGTH / 4;

// Inter-cluster edge length factor (2.0 means inter-cluster edges should be
// twice as long as intra-cluster edges)
CiSEConstants.DEFAULT_IDEAL_INTER_CLUSTER_EDGE_LENGTH_COEFF = 1.4;

// Whether to enable pulling nodes inside of the circles
CiSEConstants.DEFAULT_ALLOW_NODES_INSIDE_CIRCLE = false;

// Max percentage of the nodes in a circle that can be inside the circle
CiSEConstants.DEFAULT_MAX_RATIO_OF_NODES_INSIDE_CIRCLE = 0.2;

// -----------------------------------------------------------------------------
// Section: CiSE layout remaining constants
// -----------------------------------------------------------------------------

// Ideal length of an edge incident with an inner-node
CiSEConstants.DEFAULT_INNER_EDGE_LENGTH = FDLayoutConstants.DEFAULT_EDGE_LENGTH / 3;

// Maximum rotation angle
CiSEConstants.MAX_ROTATION_ANGLE = Math.PI / 36.0;

// Minimum rotation angle
CiSEConstants.MIN_ROTATION_ANGLE = -CiSEConstants.MAX_ROTATION_ANGLE;

// Number of iterations without swap or swap prepartion
CiSEConstants.SWAP_IDLE_DURATION = 45;

// Number of iterations required for collecting information about swapping
CiSEConstants.SWAP_PREPERATION_DURATION = 5;

// Number of iterations that should be done in between two swaps.
CiSEConstants.SWAP_PERIOD = CiSEConstants.SWAP_IDLE_DURATION + CiSEConstants.SWAP_PREPERATION_DURATION;

// Number of iterations during which history (of pairs swapped) kept
CiSEConstants.SWAP_HISTORY_CLEARANCE_PERIOD = 6 * CiSEConstants.SWAP_PERIOD;

// Buffer for swapping
CiSEConstants.MIN_DISPLACEMENT_FOR_SWAP = 6;

// Number of iterations that should be done in between two flips.
CiSEConstants.REVERSE_PERIOD = 25;

module.exports = CiSEConstants;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Simple, internal Object.assign() polyfill for options objects etc.

module.exports = Object.assign != null ? Object.assign.bind(Object) : function (tgt) {
  for (var _len = arguments.length, srcs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    srcs[_key - 1] = arguments[_key];
  }

  srcs.forEach(function (src) {
    Object.keys(src).forEach(function (k) {
      return tgt[k] = src[k];
    });
  });

  return tgt;
};

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 *
 * Choose the type of layout that best suits your usecase as a starting point.
 *
 * A discrete layout is one that algorithmically sets resultant positions.  It
 * does not have intermediate positions.
 *
 * A continuous layout is one that updates positions continuously, like a force-
 * directed / physics simulation layout.
 */
module.exports = __webpack_require__(14);

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * This class implements data and functionality required for CiSE layout per
 * cluster.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

var LGraph = __webpack_require__(0).layoutBase.LGraph;
var HashSet = __webpack_require__(0).layoutBase.HashSet;
var IGeometry = __webpack_require__(0).layoutBase.IGeometry;
var Quicksort = __webpack_require__(0).layoutBase.Quicksort;

var CircularForce = __webpack_require__(12);
var CiSEConstants = __webpack_require__(1);
var CiSEInterClusterEdgeInfo = __webpack_require__(8);

function CiSECircle(parent, graphMgr, vNode) {
    LGraph.call(this, parent, graphMgr, vNode);

    // Holds the intra-cluster edges of this circle, initially it is null. It
    // will be calculated and stored when getIntraClusterEdges method is first
    // called.
    this.intraClusterEdges = null;

    // Holds the inter-cluster edges of this circle, initially it is null. It
    // will be calculated and stored when getInterClusterEdges method is first
    // called.
    this.interClusterEdges = null;

    // Holds the nodes which don't have neighbors outside this circle
    this.inNodes = [];

    // Holds the nodes which have neighbors outside this circle
    this.outNodes = [];

    // Holds the nodes which are on the circle
    this.onCircleNodes = [];

    // Holds the nodes which are inside the circle
    this.inCircleNodes = [];

    // The radius of this circle, calculated with respect to the dimensions of
    // the nodes on this circle and node separation options
    this.radius = 0;

    // Holds the pairwise ordering of on-circle nodes computed in earlier stages
    // of layout. Value at i,j means the following assuming u and v are
    // on-circle nodes with orderIndex i and j, respectively. Value at i,j is
    // true (false) if u and v are closer when we go from u to v in clockwise
    // (counter-clockwise) direction. Here we base distance on the angles of the
    // two nodes as opposed to their order indices (this might make a difference
    // due to non-uniform node sizes).
    this.orderMatrix = null;

    // Whether or not this circle may be reserved for the purpose of improving
    // inter-cluster edge crossing number as we do not want to redundantly
    // reverse clusters and end up in oscillating situtations. Clusters with
    // special circumstances (e.g. less than two inter-cluster edge) are set as
    // may not be reversed as well.
    this.mayBeReversed = true;
}

CiSECircle.prototype = Object.create(LGraph.prototype);

for (var prop in LGraph) {
    CiSECircle[prop] = LGraph[prop];
}

// -----------------------------------------------------------------------------
// Section: Accessors and mutators
// -----------------------------------------------------------------------------
// This method returns the radius of this circle.
CiSECircle.prototype.setRadius = function (radius) {
    this.radius = radius;
};

// This method sets the radius of this circle.
CiSECircle.prototype.getRadius = function () {
    return this.radius;
};

// This method returns nodes that don't have neighbors outside this circle.
CiSECircle.prototype.getInNodes = function () {
    return this.inNodes;
};

// This method returns nodes that have neighbors outside this circle.
CiSECircle.prototype.getOutNodes = function () {
    return this.outNodes;
};

// This method returns nodes that don't have neighbors outside this circle.
CiSECircle.prototype.getOnCircleNodes = function () {
    return this.onCircleNodes;
};

// This method returns nodes that don't have neighbors outside this circle.
CiSECircle.prototype.getInCircleNodes = function () {
    return this.inCircleNodes;
};

// This method calculates and sets dimensions of the parent node of this
// circle. Parent node is centered to be at the same location of the
// associated circle but its dimensions are larger than the circle by a
// factor (must be >= 1 to ensure all nodes are enclosed within its
// rectangle) of the largest dimension (width or height) of on-circle nodes
// so that it completely encapsulates the nodes on this circle.
CiSECircle.prototype.calculateParentNodeDimension = function () {
    var self = this;

    var maxOnCircleNodeDimension = Number.MIN_SAFE_INTEGER;

    for (var i = 0; i < this.onCircleNodes.length; i++) {
        var node = this.onCircleNodes[i];

        if (node.getWidth() > maxOnCircleNodeDimension) {
            maxOnCircleNodeDimension = node.getWidth();
        }
        if (node.getHeight() > maxOnCircleNodeDimension) {
            maxOnCircleNodeDimension = node.getHeight();
        }
    }

    var dimension = 2.0 * (self.radius + 15) + maxOnCircleNodeDimension;
    var parentNode = self.getParent();
    parentNode.setHeight(dimension);
    parentNode.setWidth(dimension);
};

module.exports = CiSECircle;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * This class implements data and functionality required for CiSE layout per
 * edge.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

var FDLayoutEdge = __webpack_require__(0).layoutBase.FDLayoutEdge;

// -----------------------------------------------------------------------------
// Section: Constructors and initialization
// -----------------------------------------------------------------------------

// Constructor
function CiSEEdge(source, target, vEdge) {
  FDLayoutEdge.call(this, source, target, vEdge);

  /**
   * Flag for inter-graph edges in the base is not good enough. So we define
   * this one to mean: a CiSE edge is intra-cluster only if both its ends are
   * on a common circle; not intra-cluster, otherwise!
   */
  this.isIntraCluster = true;
}

CiSEEdge.prototype = Object.create(FDLayoutEdge.prototype);

for (var property in FDLayoutEdge) {
  CiSEEdge[property] = FDLayoutEdge[property];
}

// -----------------------------------------------------------------------------
// Section: Remaining methods
// -----------------------------------------------------------------------------


module.exports = CiSEEdge;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * This class implements a graph-manager for CiSE layout specific data and
 * functionality.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

var LGraphManager = __webpack_require__(0).layoutBase.LGraphManager;

// -----------------------------------------------------------------------------
// Section: Constructors and initialization
// -----------------------------------------------------------------------------

function CiSEGraphManager(layout) {
    LGraphManager.call(this, layout);

    /**
     * All on-circle and other nodes (unclustered nodes and nodes representing
     * each cluster/circle) in this graph manager. For efficiency purposes we
     * hold references of these nodes that we operate on in arrays.
     */

    this.onCircleNodes = [];
    this.inCircleNodes = [];
    this.nonOnCircleNodes = [];
}

CiSEGraphManager.prototype = Object.create(LGraphManager.prototype);

for (var property in LGraphManager) {
    CiSEGraphManager[property] = LGraphManager[property];
}

// -----------------------------------------------------------------------------
// Section: Accessors
// -----------------------------------------------------------------------------

// This method returns an array of all on-circle nodes.
CiSEGraphManager.prototype.getOnCircleNodes = function () {
    return this.onCircleNodes;
};

// This method returns an array of all in-circle nodes.
CiSEGraphManager.prototype.getInCircleNodes = function () {
    return this.inCircleNodes;
};

// This method returns an array of all nodes other than on-circle nodes.
CiSEGraphManager.prototype.getNonOnCircleNodes = function () {
    return this.nonOnCircleNodes;
};

// This method sets the array of all on-circle nodes.
CiSEGraphManager.prototype.setOnCircleNodes = function (nodes) {
    this.onCircleNodes = nodes;
};

// This method sets the array of all in-circle nodes.
CiSEGraphManager.prototype.setInCircleNodes = function (nodes) {
    this.inCircleNodes = nodes;
};

// This method sets the array of all nodes other than on-circle nodes.
CiSEGraphManager.prototype.setNonOnCircleNodes = function (nodes) {
    this.nonOnCircleNodes = nodes;
};

module.exports = CiSEGraphManager;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * This class keeps the information of each inter-cluster edge of the associated
 * circle. It is to be used for sorting inter-cluster edges based on this info.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

function CiSEInterClusterEdgeInfo(edge, angle) {
    // Inter-cluster edge
    this.edge = edge;

    // Angle in radians (in clockwise direction from the positive x-axis) that
    // is computed for this inter-cluster edge based on the line segment with
    // one end as the center of the associated cluster and the other end being
    // the center of the source/target node of this inter-cluster edge that is
    // not in this cluster.
    this.angle = angle;
}

CiSEInterClusterEdgeInfo.prototype = Object.create(null);

CiSEInterClusterEdgeInfo.prototype.getEdge = function () {
    return this.edge;
};

CiSEInterClusterEdgeInfo.prototype.getAngle = function () {
    return this.angle;
};

module.exports = CiSEInterClusterEdgeInfo;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * This class implements a Circular Spring Embedder (CiSE) layout algortithm.
 * The algorithm is used for layout of clustered nodes where nodes in each
 * cluster is drawn around a circle. The basic steps of the algorithm follows:
 * - Step 1: each cluster is laid out with AVSDF circular layout algorithm;
 * - Step 2: cluster graph (quotient graph of the clustered graph, where nodes
 *   correspond to clusters and edges correspond to inter-cluster edges) is laid
 *   out with a spring embedder to determine the initial layout;
 * - Steps 3-5: the cluster graph is laid out with a modified spring embedder,
 *   where the nodes corresponding to clusters are also allowed to rotate,
 *   indirectly affecting the layout of the nodes inside the clusters. In Step
 *   3, we allow flipping of clusters, whereas in Step 4, we allow swapping of
 *   neighboring node pairs in a cluster to improve inter-cluster edge crossings
 *   without increasing intra-cluster crossings.
 *
 *   The input view aspect of GraphManager is inherited from Java version of
 *   CiSE (Chilay) as a side effect. Ignore any references to 'view' elements.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

// -----------------------------------------------------------------------------
// Section: Initializations
// -----------------------------------------------------------------------------

var Layout = __webpack_require__(0).layoutBase.FDLayout;
var HashMap = __webpack_require__(0).layoutBase.HashMap;
var PointD = __webpack_require__(0).layoutBase.PointD;
var DimensionD = __webpack_require__(0).layoutBase.DimensionD;

var CiSEConstants = __webpack_require__(1);
var CiSEGraphManager = __webpack_require__(7);
var CiSECircle = __webpack_require__(5);
var CiSENode = __webpack_require__(10);
var CiSEEdge = __webpack_require__(6);

var AVSDFConstants = __webpack_require__(0).AVSDFConstants;
var AVSDFLayout = __webpack_require__(0).AVSDFLayout;

var CoSELayout = __webpack_require__(3).CoSELayout;
var CoSEConstants = __webpack_require__(3).CoSEConstants;

// Constructor
function CiSELayout() {
    Layout.call(this);

    /**
     * Separation of the nodes on each circle customizable by the user
     */
    this.nodeSeparation = CiSEConstants.DEFAULT_NODE_SEPARATION;

    /**
     * Ideal edge length coefficient for inter-cluster edges
     */
    this.idealInterClusterEdgeLengthCoefficient = CiSEConstants.DEFAULT_IDEAL_INTER_CLUSTER_EDGE_LENGTH_COEFF;

    /**
     * Decides whether pull on-circle nodes inside of the circle.
     */
    this.allowNodesInsideCircle = CiSEConstants.DEFAULT_ALLOW_NODES_INSIDE_CIRCLE;

    /**
     * Max percentage of the nodes in a circle that can move inside the circle
     */
    this.maxRatioOfNodesInsideCircle = CiSEConstants.DEFAULT_MAX_RATIO_OF_NODES_INSIDE_CIRCLE;

    /**
     * Current step of the layout process
     */
    this.step = CiSELayout.STEP_NOT_STARTED;

    /**
     * Current phase of current step
     */
    this.phase = CiSELayout.PHASE_NOT_STARTED;

    /**
     * Holds the set of pairs swapped in the last swap phase.
     */
    this.swappedPairsInLastIteration = {};

    this.oldTotalDisplacement = 0.0;

    // -----------------------------------------------------------------------------
    // Section: Class constants
    // -----------------------------------------------------------------------------
    /**
     * Steps of layout
     */
    this.STEP_NOT_STARTED = 0;
    this.STEP_1 = 1;
    this.STEP_2 = 2;
    this.STEP_3 = 3;
    this.STEP_4 = 4;
    this.STEP_5 = 5;

    this.iterations = 0;

    /**
     * Phases of a step
     */
    this.PHASE_NOT_STARTED = 0;
    this.PHASE_SWAP_PREPERATION = 1;
    this.PHASE_PERFORM_SWAP = 2;
    this.PHASE_OTHER = 3;
}

CiSELayout.prototype = Object.create(Layout.prototype);

for (var property in Layout) {
    CiSELayout[property] = Layout[property];
}

/**
 * This method creates a new graph manager associated with this layout.
 */
CiSELayout.prototype.newGraphManager = function () {
    this.graphManager = new CiSEGraphManager(this);
    return this.graphManager;
};

/**
 * This method creates a new graph(CiSECircle) associated with the input view graph.
 */
CiSELayout.prototype.newCircleLGraph = function (vGraph) {
    return new CiSECircle(null, this.graphManager, vGraph);
};

/**
 * This method creates a new node associated with the input view node.
 */
CiSELayout.prototype.newNode = function (loc, size) {
    return new CiSENode(this.graphManager, loc, size, null);
};

/**
 * This method creates a new on-circle CiSE node associated with the input
 * view node.
 */
CiSELayout.prototype.newCiSEOnCircleNode = function (loc, size) {
    var newNode = this.newNode(loc, size);
    newNode.setAsOnCircleNode();

    return newNode;
};

/**
 * This method creates a new edge associated with the input view edge.
 */
CiSELayout.prototype.newEdge = function (source, target, vEdge) {
    return new CiSEEdge(source, target, vEdge);
};

/**
 * This method establishes the GraphManager object related to this layout. Each compound(LGraph) is CiSECircle except
 * for the root.
 * @param nodes: All nodes in the graph
 * @param edges: All edges in the graph
 * @param clusters: Array of cluster ID arrays. Each array represents a cluster where ID ∈ {0,1,2,..,n(# of clusters)}
 *
 * Notes:
 * -> For unclustered nodes, their clusterID is -1.
 * -> CiSENode that corresponds to a cluster has no ID property.
 */
CiSELayout.prototype.convertToClusteredGraph = function (nodes, edges, clusters) {
    var _this = this;

    var self = this;
    var idToLNode = {};
    var rootGraph = this.graphManager.getRoot();

    // Firstly, lets create a HashMap to get node properties easier
    var idToCytoscapeNode = new HashMap();
    for (var i = 0; i < nodes.length; i++) {
        idToCytoscapeNode.put(nodes[i].data('id'), nodes[i]);
    }

    // lets add the nodes in clusters to the GraphManager

    var _loop = function _loop(_i) {
        // Create a CiSENode for the cluster
        var clusterNode = _this.newNode(null);

        // ClusterID ∈ {0,1,2,..,n(# of clusters)}
        clusterNode.setClusterId(_i);

        // Add it rootGraph
        rootGraph.add(clusterNode);

        // Create the associated Circle representing the cluster and link them together
        var circle = _this.newCircleLGraph(null);
        _this.graphManager.add(circle, clusterNode);

        // Move each node of the cluster into this circle
        clusters[_i].forEach(function (nodeID) {
            var cytoNode = idToCytoscapeNode.get(nodeID);
            var dimensions = cytoNode.layoutDimensions({
                nodeDimensionsIncludeLabels: false
            });
            // Adding a node into the circle
            var ciseNode = self.newCiSEOnCircleNode(new PointD(cytoNode.position('x') - dimensions.w / 2, cytoNode.position('y') - dimensions.h / 2), new DimensionD(parseFloat(dimensions.w), parseFloat(dimensions.h)));
            ciseNode.setId(nodeID);
            ciseNode.setClusterId(_i);
            circle.getOnCircleNodes().push(ciseNode);
            circle.add(ciseNode);

            // Initially all on-circle nodes are assumed to be in-nodes
            circle.getInNodes().push(ciseNode);

            // Map the node
            idToLNode[ciseNode.getId()] = ciseNode;
        });
    };

    for (var _i = 0; _i < clusters.length; _i++) {
        _loop(_i);
    }

    // Now, add unclustered nodes to the GraphManager

    var _loop2 = function _loop2(_i2) {
        var clustered = false;

        clusters.forEach(function (cluster) {
            if (cluster.includes(nodes[_i2].data('id'))) clustered = true;
        });

        if (!clustered) {
            var cytoNode = nodes[_i2];
            var dimensions = cytoNode.layoutDimensions({
                nodeDimensionsIncludeLabels: false
            });
            var _CiSENode = _this.newNode(new PointD(cytoNode.position('x') - dimensions.w / 2, cytoNode.position('y') - dimensions.h / 2), new DimensionD(parseFloat(dimensions.w), parseFloat(dimensions.h)));
            _CiSENode.setClusterId(-1);
            _CiSENode.setId(nodes[_i2].data('id'));
            rootGraph.add(_CiSENode);

            // Map the node
            idToLNode[_CiSENode.getId()] = _CiSENode;
        }
    };

    for (var _i2 = 0; _i2 < nodes.length; _i2++) {
        _loop2(_i2);
    }

    // Lastly, add all edges
    for (var _i3 = 0; _i3 < edges.length; _i3++) {
        var e = edges[_i3];
        var sourceNode = idToLNode[e.data("source")];
        var targetNode = idToLNode[e.data("target")];
        var sourceClusterID = sourceNode.getClusterId();
        var targetClusterID = targetNode.getClusterId();

        if (sourceNode === targetNode) continue;

        var ciseEdge = self.newEdge(sourceNode, targetNode, null);

        // Edge is intracluster
        // Remember: If source or target is unclustered then edge is Not intracluster
        if (sourceClusterID === targetClusterID && sourceClusterID !== -1 && targetClusterID !== -1) {
            ciseEdge.isIntraCluster = true;
            ciseEdge.getSource().getOwner().add(ciseEdge, ciseEdge.getSource(), ciseEdge.getTarget());
        } else {
            ciseEdge.isIntraCluster = false;
            this.graphManager.add(ciseEdge, ciseEdge.getSource(), ciseEdge.getTarget());
        }
    }

    // Populate the references of GraphManager
    var onCircleNodes = [];
    var nonOnCircleNodes = [];
    var allNodes = this.graphManager.getAllNodes();
    for (var _i4 = 0; _i4 < allNodes.length; _i4++) {
        if (allNodes[_i4].getOnCircleNodeExt()) {
            onCircleNodes.push(allNodes[_i4]);
        } else {
            nonOnCircleNodes.push(allNodes[_i4]);
        }
    }

    this.graphManager.setOnCircleNodes(onCircleNodes);
    this.graphManager.setNonOnCircleNodes(nonOnCircleNodes);

    // Deternine out-nodes of each circle
    this.graphManager.edges.forEach(function (e) {
        var sourceNode = e.getSource();
        var targetNode = e.getTarget();
        var sourceClusterID = sourceNode.getClusterId();
        var targetClusterID = targetNode.getClusterId();

        // If an on-circle node is an out-node, then remove it from the
        // in-node list and add it to out-node list of the associated
        // circle. Notice that one or two ends of an inter-graph edge will
        // be out-node(s).
        if (sourceClusterID !== -1) {
            var _circle = sourceNode.getOwner();

            // Make sure it has not been already moved to the out node list
            var index = _circle.getInNodes().indexOf(sourceNode);
            if (index > -1) {
                _circle.getInNodes().splice(index, 1);
                _circle.getOutNodes().push(sourceNode);
            }
        }

        if (targetClusterID !== -1) {
            var _circle2 = targetNode.getOwner();

            // Make sure it has not been already moved to the out node list
            var _index = _circle2.getInNodes().indexOf(targetNode);
            if (_index > -1) {
                _circle2.getInNodes().splice(_index, 1);
                _circle2.getOutNodes().push(targetNode);
            }
        }
    });

    return idToLNode;
};

/**
 * This method runs AVSDF layout for each cluster.
 */
CiSELayout.prototype.doStep1 = function () {
    this.step = CiSELayout.STEP_1;
    this.phase = CiSELayout.PHASE_OTHER;

    // Mapping for transferring positions and dimensions back
    var ciseToAvsdf = new HashMap();

    var allGraphs = this.graphManager.getGraphs();
    for (var i = 0; i < allGraphs.length; i++) {
        var graph = allGraphs[i];

        // Skip the root graph which is a normal LGraph
        if (graph instanceof CiSECircle) {
            // Create the AVSDF layout objects
            AVSDFConstants.DEFAULT_NODE_SEPARATION = this.nodeSeparation;
            var avsdfLayout = new AVSDFLayout();
            var avsdfCircle = avsdfLayout.graphManager.addRoot();
            var clusteredNodes = graph.getOnCircleNodes();

            // Create corresponding AVSDF nodes in current cluster
            for (var _i5 = 0; _i5 < clusteredNodes.length; _i5++) {
                var ciseOnCircleNode = clusteredNodes[_i5];

                var avsdfNode = avsdfLayout.newNode(null);
                var loc = ciseOnCircleNode.getLocation();
                avsdfNode.setLocation(loc.x, loc.y);
                avsdfNode.setWidth(ciseOnCircleNode.getWidth());
                avsdfNode.setHeight(ciseOnCircleNode.getHeight());
                avsdfCircle.add(avsdfNode);

                ciseToAvsdf.put(ciseOnCircleNode, avsdfNode);
            }

            // For each edge, create a corresponding AVSDF edge if its both ends
            // are in this cluster.
            var allEdges = this.getAllEdges();
            for (var _i6 = 0; _i6 < allEdges.length; _i6++) {
                var edge = allEdges[_i6];

                if (clusteredNodes.includes(edge.getSource()) && clusteredNodes.includes(edge.getTarget())) {
                    var avsdfSource = ciseToAvsdf.get(edge.getSource());
                    var avsdfTarget = ciseToAvsdf.get(edge.getTarget());
                    var avsdfEdge = avsdfLayout.newEdge("");

                    avsdfCircle.add(avsdfEdge, avsdfSource, avsdfTarget);
                }
            }

            console.log(this.graphManager);

            // Run AVSDF layout
            avsdfLayout.layout();

            // Do post-processing
            var sortedByDegreeList = avsdfLayout.initPostProcess();
            for (var _i7 = 0; _i7 < sortedByDegreeList.length; _i7++) {
                avsdfLayout.oneStepPostProcess(sortedByDegreeList[_i7]);
            }
            avsdfLayout.updateNodeAngles();
            avsdfLayout.updateNodeCoordinates();

            // Reflect changes back to CiSENode's
            for (var _i8 = 0; _i8 < clusteredNodes.length; _i8++) {
                var _ciseOnCircleNode = clusteredNodes[_i8];
                var _avsdfNode = ciseToAvsdf.get(_ciseOnCircleNode);
                var _loc = _avsdfNode.getLocation();
                _ciseOnCircleNode.setLocation(_loc.x, _loc.y);
                _ciseOnCircleNode.getOnCircleNodeExt().setIndex(_avsdfNode.getIndex());
                _ciseOnCircleNode.getOnCircleNodeExt().setAngle(_avsdfNode.getAngle());
            }

            // Sort nodes of this ciseCircle according to circle indexes of
            // ciseOnCircleNodes.
            clusteredNodes.sort(function (a, b) {
                return a.getOnCircleNodeExt().getIndex() - b.getOnCircleNodeExt().getIndex();
            });

            // Assign width and height of the AVSDF circle containing the nodes
            // above to the corresponding cise-circle.
            if (avsdfCircle.getNodes().length > 0) {
                var parentCiSE = graph.getParent();
                var parentAVSDF = avsdfCircle.getParent();
                parentCiSE.setLocation(parentAVSDF.getLocation().x, parentAVSDF.getLocation().y);
                graph.setRadius(avsdfCircle.getRadius());
                graph.calculateParentNodeDimension();
            }
        }
    }
};

/**
 * This method runs a spring embedder on the cluster-graph (quotient graph
 * of the clustered graph) to determine initial layout.
 */
CiSELayout.prototype.doStep2 = function () {
    this.step = CiSELayout.STEP_2;
    this.phase = CiSELayout.PHASE_OTHER;
    var newCoSENodes = [];
    var newCoSEEdges = [];

    // Used for holding conversion mapping between cise and cose nodes.
    var ciseNodeToCoseNode = new HashMap();

    // Used for reverse mapping between cose and cise edges while sorting
    // incident edges.
    var coseEdgeToCiseEdges = new HashMap();

    // Create a CoSE layout object
    var coseLayout = new CoSELayout();
    coseLayout.isSubLayout = false;
    coseLayout.useMultiLevelScaling = false;
    coseLayout.useFRGridVariant = true;
    coseLayout.springConstant *= 1.5;
    var gm = coseLayout.newGraphManager();
    var coseRoot = gm.addRoot();

    // Traverse through all nodes and create new CoSENode's.
    var nonOnCircleNodes = this.graphManager.getNonOnCircleNodes();
    for (var i = 0; i < nonOnCircleNodes.length; i++) {
        var ciseNode = nonOnCircleNodes[i];

        var newNode = coseLayout.newNode(null);
        var loc = ciseNode.getLocation();
        newNode.setLocation(loc.x, loc.y);
        newNode.setWidth(ciseNode.getWidth());
        newNode.setHeight(ciseNode.getHeight());

        // Set nodes corresponding to circles to be larger than original, so
        // inter-cluster edges end up longer.
        if (ciseNode.getChild() != null) {
            newNode.setWidth(1.2 * newNode.getWidth());
            newNode.setHeight(1.2 * newNode.getHeight());
        }

        coseRoot.add(newNode);
        newCoSENodes.push(newNode);
        ciseNodeToCoseNode.put(ciseNode, newNode);
    }

    // Used for preventing duplicate edge creation between two cose nodes
    var nodePairs = new Array(newCoSENodes.length);
    for (var _i9 = 0; _i9 < nodePairs.length; _i9++) {
        nodePairs[_i9] = new Array(newCoSENodes.length);
    }

    // Traverse through edges and create cose edges for inter-cluster ones.
    var allEdges = this.graphManager.getAllEdges();
    for (var _i10 = 0; _i10 < allEdges.length; _i10++) {
        var ciseEdge = allEdges[_i10];
        var sourceCise = ciseEdge.getSource();
        var targetCise = ciseEdge.getTarget();

        // Determine source and target nodes for current edge
        if (sourceCise.getOnCircleNodeExt() != null) {
            // Source node is an on-circle node, take its parent as source node
            sourceCise = ciseEdge.getSource().getOwner().getParent();
        }
        if (targetCise.getOnCircleNodeExt() != null) {
            // Target node is an on-circle node, take its parent as target node
            targetCise = ciseEdge.getTarget().getOwner().getParent();
        }

        var sourceCose = ciseNodeToCoseNode.get(sourceCise);
        var targetCose = ciseNodeToCoseNode.get(targetCise);
        var sourceIndex = newCoSENodes.indexOf(sourceCose);
        var targetIndex = newCoSENodes.indexOf(targetCose);

        var newEdge = void 0;
        if (sourceIndex !== targetIndex) {
            // Make sure it's an inter-cluster edge

            if (nodePairs[sourceIndex][targetIndex] == null && nodePairs[targetIndex][sourceIndex] == null) {
                newEdge = coseLayout.newEdge(null);
                coseRoot.add(newEdge, sourceCose, targetCose);
                newCoSEEdges.push(newEdge);

                coseEdgeToCiseEdges.put(newEdge, []);

                nodePairs[sourceIndex][targetIndex] = newEdge;
                nodePairs[targetIndex][sourceIndex] = newEdge;
            } else {
                newEdge = nodePairs[sourceIndex][targetIndex];
            }

            coseEdgeToCiseEdges.get(newEdge).push(ciseEdge);
        }
    }

    //this.reorderIncidentEdges(ciseNodeToCoseNode, coseEdgeToCiseEdges);

    // Run CoSELayout
    coseLayout.runLayout();

    // Reflect changes back to cise nodes
    // First update all non-on-circle nodes.
    for (var _i11 = 0; _i11 < nonOnCircleNodes.length; _i11++) {
        var _ciseNode = nonOnCircleNodes[_i11];
        var coseNode = ciseNodeToCoseNode.get(_ciseNode);
        var _loc2 = coseNode.getLocation();
        _ciseNode.setLocation(_loc2.x, _loc2.y);
    }

    // Then update all cise on-circle nodes, since their parents have
    // changed location.

    var onCircleNodes = this.graphManager.getOnCircleNodes();

    for (var _i12 = 0; _i12 < onCircleNodes.length; _i12++) {
        var _ciseNode2 = onCircleNodes[_i12];
        var _loc3 = _ciseNode2.getLocation();
        var parentLoc = _ciseNode2.getOwner().getParent().getLocation();
        _ciseNode2.setLocation(_loc3.x + parentLoc.x, _loc3.y + parentLoc.y);
    }
};

/**
 * This method sorts incident lists of cose nodes created earlier according
 * to node ordering inside corresponding cise circles, if any. For each cose
 * edge we have one or possibly more cise edges. Let's look up their indices
 * and somehow do a smart calculation of their average. So if this cluster A
 * is connected to cluster B via on-circle nodes indexed at 3, 6, and 12,
 * then we may imagine that cluster B should be aligned with the node
 * indexed at 7 [=(3+6+12)/3]. The input parameters reference the hash maps
 * maintaining correspondence between cise and cose nodes (1-1) and cose and
 * cise edges (1-many), respectively.
 **/
CiSELayout.prototype.reorderIncidentEdges = function (ciseNodeToCoseNode, coseEdgeToCiseEdges) {

    var nonOnCircleNodes = this.graphManager.getNonOnCircleNodes();

    var _loop3 = function _loop3(i) {
        if (nonOnCircleNodes[i].getChild() == null) {
            return 'continue';
        }

        var ciseCircle = nonOnCircleNodes[i].getChild();
        var mod = ciseCircle.getOnCircleNodes().length;
        var coseNode = ciseNodeToCoseNode.get(ciseCircle.getParent());
        var incidentCoseEdges = coseNode.getEdges();
        var indexMapping = new HashMap();

        var _loop4 = function _loop4(j) {
            var coseEdge = incidentCoseEdges[j];
            var edgeIndices = [];
            var ciseEdges = coseEdgeToCiseEdges.get(coseEdge);
            ciseEdges.forEach(function (ciseEdge) {
                var edgeIndex = -1;
                if (ciseEdge.getSource().getOwner() === ciseCircle) {
                    edgeIndex = ciseEdge.getSource().getOnCircleNodeExt().getIndex();
                } else if (ciseEdge.getTarget().getOwner() === ciseCircle) {
                    edgeIndex = ciseEdge.getTarget().getOnCircleNodeExt().getIndex();
                }

                edgeIndices.push(edgeIndex);
            });

            edgeIndices.sort();

            // When averaging indices, we need to make sure it falls to the
            // correct side, simple averaging will not always work. For
            // instance, if indices are 0, 1, and 5 for a 6 node circle /
            // cluster, we want the average to be 0 [=(0+1+(-1))/3] as
            // opposed to 2 [=(0+1+5)/3]. We need to calculate the largest
            // gap between adjacent indices (1 to 5 in this case) here.
            // Indices after the start of the largest gap are to be adjusted
            // (by subtracting mod from each), so the average falls into the
            // correct side.

            var indexLargestGapStart = -1;
            var largestGap = -1;
            var gap = void 0;

            // calculate largest gap and its starting index

            var indexIter = edgeIndices[Symbol.iterator]();
            var edgeIndex = null;
            var prevEdgeIndex = null;
            var firstEdgeIndex = -1;
            var edgeIndexPos = -1;

            for (var z = 0; z < edgeIndices.length; z++) {
                prevEdgeIndex = edgeIndex;
                edgeIndex = edgeIndices[z];
                edgeIndexPos++;

                if (prevEdgeIndex !== null) {
                    gap = edgeIndex - prevEdgeIndex;

                    if (gap > largestGap) {
                        largestGap = gap;
                        indexLargestGapStart = edgeIndexPos - 1;
                    }
                } else {
                    firstEdgeIndex = edgeIndex;
                }
            }

            if (firstEdgeIndex !== -1 && firstEdgeIndex + mod - edgeIndex > largestGap) {
                largestGap = firstEdgeIndex + mod - edgeIndex;
                indexLargestGapStart = edgeIndexPos;
            }

            // adjust indices after the start of the gap (beginning with the
            // index that marks the end of the largest gap)

            var edgeCount = edgeIndices.length;

            if (largestGap > 0) {
                var index = void 0;

                for (var k = indexLargestGapStart + 1; k < edgeCount; k++) {
                    index = edgeIndices[k];
                    edgeIndices[k] = index - mod;
                }
            }

            // Sum up indices
            var averageIndex = void 0;
            var totalIndex = 0;

            for (var _z = 0; _z < edgeIndices.length; _z++) {
                edgeIndex = edgeIndices[_z];
                totalIndex += edgeIndex;
            }

            averageIndex = totalIndex / edgeCount;

            if (averageIndex < 0) {
                averageIndex += mod;
            }

            indexMapping.put(coseEdge, averageIndex);
        };

        for (var j = 0; j < incidentCoseEdges.length; j++) {
            _loop4(j);
        }

        incidentCoseEdges.sort(function (a, b) {
            return indexMapping.get(a) - indexMapping.get(b);
        });
    };

    for (var i = 0; i < nonOnCircleNodes.length; i++) {
        var _ret3 = _loop3(i);

        if (_ret3 === 'continue') continue;
    }
};

/**
 * This method prepares circles for possible reversal by computing the order
 * matrix of each circle. It also determines any circles that should never
 * be reversed (e.g. when it has no more than 1 inter-cluster edge).
 */

CiSELayout.prototype.prepareCirclesForReversal = function () {
    var self = this;

    var nodes = this.graphManager.getRoot().getNodes();
    nodes.forEach(function (node) {
        var circle = node.getChild();
        if (circle !== null || circle !== undefined) {
            if (circle.getInterClusterEdges().length < 2) circle.setMayNotBeReversed();

            circle.computeOrderMatrix();
        }
    });
};

module.exports = CiSELayout;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * This class implements data and functionality required for CiSE layout per
 * node.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

var FDLayoutNode = __webpack_require__(0).layoutBase.FDLayoutNode;
var IMath = __webpack_require__(0).layoutBase.IMath;
var CiSEConstants = __webpack_require__(1);
var CiSEOnCircleNodeExt = __webpack_require__(11);

function CiSENode(gm, loc, size, vNode) {
    // the constructor of LNode handles alternative constructors
    FDLayoutNode.call(this, gm, loc, size, vNode);

    /**
     * Amount by which this node will be rotated in this iteration. Note that
     * clockwise rotation is positive and counter-clockwise is negative.
     */
    this.rotationAmount = null;

    // Extension for on-circle nodes
    this.onCircleNodeExt = null; //Extension for on-circle nodes

    // Cluster ID which the node belongs to
    this.clusterID = null;

    // Cytoscape node ID for transforming between layout and cytoscape
    this.ID = null;
}

CiSENode.prototype = Object.create(FDLayoutNode.prototype);

for (var prop in FDLayoutNode) {
    CiSENode[prop] = FDLayoutNode[prop];
}

// -----------------------------------------------------------------------------
// Section: Accessors and mutators
// -----------------------------------------------------------------------------

// This method resets displacement values
CiSENode.prototype.reset = function () {
    this.displacementX = 0.0;
    this.displacementY = 0.0;
};

CiSENode.prototype.setClusterId = function (cID) {
    this.clusterID = cID;
};

CiSENode.prototype.getClusterId = function () {
    return this.clusterID;
};

CiSENode.prototype.setId = function (ID) {
    this.ID = ID;
};

CiSENode.prototype.getId = function () {
    return this.ID;
};

// This method sets this node as an on-circle node by creating an extension for it.
CiSENode.prototype.setAsOnCircleNode = function () {
    this.onCircleNodeExt = new CiSEOnCircleNodeExt(this);
    return this.onCircleNodeExt;
};

// This method sets this node as an non on-circle node by deleting the
// extension for it.
CiSENode.prototype.setAsNonOnCircleNode = function () {
    this.onCircleNodeExt = null;
};

// This method returns the extension of this node for on-circle nodes. This
// extension is null if this node is a non-on-circle node.
CiSENode.prototype.getOnCircleNodeExt = function () {
    return this.onCircleNodeExt;
};

module.exports = CiSENode;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * This class implements data and functionality required for CiSE layout per
 * on-circle node. In other words, it is an extension to CiSENode class for
 * on-circle nodes.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

var IGeometry = __webpack_require__(0).layoutBase.IGeometry;

// -----------------------------------------------------------------------------
// Section: Constructors and initializations
// -----------------------------------------------------------------------------


function CiSEOnCircleNodeExt(ciseNode) {
    // Associated CiSE node
    this.ciseNode = ciseNode;

    // Holds the intra-cluster edges of this node, initially it is null. It
    // will be calculated and stored when getIntraClusterEdges method is first
    // called.
    this.intraClusterEdges = null;

    // Holds the inter-cluster edges of this node, initially it is null. It
    // will be calculated and stored when getInterClusterEdges method is first
    // called.
    this.interClusterEdges = null;

    // Holds relative position of this node with respect to its owner circle
    // It is less than 0 (=-1) only if not assigned. Its unit is radian.
    this.angle = -1;

    // Holds current index of this node within its owner circle; it is -1 if not
    // assigned.
    this.orderIndex = -1;

    // Indicates whether a swapping with next node in the owner circle order
    // will cause no additional crossings or not.
    this.canSwapWithNext = null;

    // Indicates whether a swapping with previous node in the owner circle order
    // will cause no additional crossings or not.
    this.canSwapWithPrevious = null;

    // Holds the total weighted displacement value calculated over a constant
    // number of iterations used for deciding whether two nodes should be
    // swapped.
    this.displacementForSwap = null;
}

CiSEOnCircleNodeExt.prototype = Object.create(null);

// -----------------------------------------------------------------------------
// Section: Accessors and mutators
// -----------------------------------------------------------------------------


// This function returns the associated CiSENode
CiSEOnCircleNodeExt.prototype.getCiseNode = function () {
    return this.ciseNode;
};

// This function returns the relative position of this node
// within it's owner circle
CiSEOnCircleNodeExt.prototype.getAngle = function () {
    return this.angle;
};

// This function sets the relative position of this node within its owner
// circle. We keep the angle positive for easy debugging.
CiSEOnCircleNodeExt.prototype.setAngle = function (angle) {
    this.angle = angle % IGeometry.TWO_PI;
    if (this.angle < 0) {
        this.angle += IGeometry.TWO_PI;
    }
};

// This function returns current index of this in it's owner circle
CiSEOnCircleNodeExt.prototype.getIndex = function () {
    return this.orderIndex;
};

// This function sets current index of this node in its owner circle.
CiSEOnCircleNodeExt.prototype.setIndex = function (index) {
    this.orderIndex = index;
};

module.exports = CiSEOnCircleNodeExt;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * This class is a utility class that is used to store the rotation amount,
 * x-axis displacement and y-axis displacement components of a force that act
 * upon an on-circle node. The calculation for this is done in CiSECircle for
 * specified on-circle node. Here we assume that forces on on-circle nodes can
 * be modelled with forces acting upon the perimeter of a circular flat, rigid
 * object sitting on a 2-dimensional surface, free to move in a direction
 * without any friction. Thus, such an object is assumed to move and rotate on
 * this force in amounts proportional to the total force (not just the vertical
 * component of the force!) and the component of the force that is tangential to
 * the circular shape of the object, respectively.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

// -----------------------------------------------------------------------------
// Section: Constructors and initializations
// -----------------------------------------------------------------------------

function CircularForce(rotationAmount, displacementX, displacementY) {
    // This is the rotation amount that is to be assigned to the rotationAmount
    // of a CiSENode
    this.rotationAmount = rotationAmount;

    // This is the x-axis displacement value that is to be assigned to the displacementX
    // of a CiSENode
    this.displacementX = displacementX;

    // This is the y-axis displacement value that is to be assigned to the displacementY
    // of a CiSENode
    this.displacementY = displacementY;
}

// -----------------------------------------------------------------------------
// Section: Accessors and mutators
// -----------------------------------------------------------------------------

CircularForce.prototype.getRotationAmount = function () {
    return this.rotationAmount;
};

CircularForce.prototype.setRotationAmount = function (rotationAmount) {
    this.rotationAmount = rotationAmount;
};

CircularForce.prototype.getDisplacementX = function () {
    return this.displacementX;
};

CircularForce.prototype.setDisplacementX = function (displacementX) {
    this.displacementX = displacementX;
};

CircularForce.prototype.getDisplacementY = function () {
    return this.displacementY;
};

CircularForce.prototype.setDisplacementY = function (displacementY) {
    this.displacementY = displacementY;
};

module.exports = CircularForce;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var impl = __webpack_require__(4);

// registers the extension on a cytoscape lib ref
var register = function register(cytoscape) {
  if (!cytoscape) {
    return;
  } // can't register if cytoscape unspecified

  cytoscape('layout', 'cise', impl); // register with cytoscape.js
};

if (typeof cytoscape !== 'undefined') {
  // expose to global cytoscape (i.e. window.cytoscape)
  register(cytoscape);
}

module.exports = register;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CiSELayout = __webpack_require__(9);
var CiSEConstants = __webpack_require__(1);

var ContinuousLayout = __webpack_require__(16);
var defaults = ContinuousLayout.defaults;
var assign = __webpack_require__(2);
var isFn = function isFn(fn) {
  return typeof fn === 'function';
};

var optFn = function optFn(opt, ele) {
  if (isFn(opt)) {
    return opt(ele);
  } else {
    return opt;
  }
};

var Layout = function (_ContinuousLayout) {
  _inherits(Layout, _ContinuousLayout);

  function Layout(options) {
    _classCallCheck(this, Layout);

    var _this = _possibleConstructorReturn(this, (Layout.__proto__ || Object.getPrototypeOf(Layout)).call(this, assign({}, defaults, options)));

    CiSEConstants.DEFAULT_NODE_SEPARATION = options.DEFAULT_NODE_SEPARATION;
    return _this;
  }

  _createClass(Layout, [{
    key: 'prerun',
    value: function prerun() {
      var state = this.state;

      //Get the graph information from Cytoscape
      var clusters = this.options.clusters; //TODO take cluster as a function as well?
      var nodes = state.nodes;
      var edges = state.edges;

      //Initialize CiSE elements
      var ciseLayout = this.ciseLayout = new CiSELayout();
      var graphManager = this.graphManager = ciseLayout.newGraphManager();
      var root = this.root = graphManager.addRoot();

      // Construct the GraphManager according to the graph from Cytoscape
      this.idToLNode = ciseLayout.convertToClusteredGraph(nodes, edges, clusters);

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

  }, {
    key: 'tick',
    value: function tick() {
      var _this2 = this;

      var self = this;
      var state = this.state;
      var isDone = true;

      state.nodes.forEach(function (n) {
        var s = _this2.getScratch(n);

        var location = self.idToLNode[n.data('id')].getLocation();
        s.x = location.x;
        s.y = location.y;
      });

      return isDone;
    }

    // run this function after the layout is done ticking

  }, {
    key: 'postrun',
    value: function postrun() {}

    // clean up any object refs that could prevent garbage collection, etc.

  }, {
    key: 'destroy',
    value: function destroy() {
      _get(Layout.prototype.__proto__ || Object.getPrototypeOf(Layout.prototype), 'destroy', this).call(this);

      return this;
    }
  }]);

  return Layout;
}(ContinuousLayout);

module.exports = Layout;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// general default options for force-directed layout

module.exports = Object.freeze({
  animate: false, // whether to show the layout as it's running; special 'end' value makes the layout animate like a discrete layout
  refresh: 10, // number of ticks per frame; higher is faster but more jerky
  maxIterations: 1000, // max iterations before the layout will bail out
  maxSimulationTime: 4000, // max length in ms to run the layout
  ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
  fit: true, // on every layout reposition of nodes, fit the viewport
  padding: 30, // padding around the simulation
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }

  // layout event callbacks
  ready: function ready() {}, // on layoutready
  stop: function stop() {}, // on layoutstop

  // positioning options
  randomize: false, // use random node positions at beginning of layout

  // infinite layout options
  infinite: false // overrides all other options for a forces-all-the-time mode
});

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
A generic continuous layout class
*/

var assign = __webpack_require__(2);
var defaults = __webpack_require__(15);
var makeBoundingBox = __webpack_require__(17);

var _require = __webpack_require__(18),
    setInitialPositionState = _require.setInitialPositionState,
    refreshPositions = _require.refreshPositions,
    getNodePositionData = _require.getNodePositionData;

var _require2 = __webpack_require__(19),
    multitick = _require2.multitick;

var Layout = function () {
  function Layout(options) {
    _classCallCheck(this, Layout);

    var o = this.options = assign({}, defaults, options);

    var s = this.state = assign({}, o, {
      layout: this,
      nodes: o.eles.nodes(),
      edges: o.eles.edges(),
      tickIndex: 0,
      firstUpdate: true
    });

    s.animateEnd = o.animate && o.animate === 'end';
    s.animateContinuously = o.animate && !s.animateEnd;
  }

  _createClass(Layout, [{
    key: 'getScratch',
    value: function getScratch(el) {
      var name = this.state.name;
      var scratch = el.scratch(name);

      if (!scratch) {
        scratch = {};

        el.scratch(name, scratch);
      }

      return scratch;
    }
  }, {
    key: 'run',
    value: function run() {
      var l = this;
      var s = this.state;

      s.tickIndex = 0;
      s.firstUpdate = true;
      s.startTime = Date.now();
      s.running = true;

      s.currentBoundingBox = makeBoundingBox(s.boundingBox, s.cy);

      if (s.ready) {
        l.one('ready', s.ready);
      }
      if (s.stop) {
        l.one('stop', s.stop);
      }

      s.nodes.forEach(function (n) {
        return setInitialPositionState(n, s);
      });

      l.prerun(s);

      if (s.animateContinuously) {
        var ungrabify = function ungrabify(node) {
          if (!s.ungrabifyWhileSimulating) {
            return;
          }

          var grabbable = getNodePositionData(node, s).grabbable = node.grabbable();

          if (grabbable) {
            node.ungrabify();
          }
        };

        var regrabify = function regrabify(node) {
          if (!s.ungrabifyWhileSimulating) {
            return;
          }

          var grabbable = getNodePositionData(node, s).grabbable;

          if (grabbable) {
            node.grabify();
          }
        };

        var updateGrabState = function updateGrabState(node) {
          return getNodePositionData(node, s).grabbed = node.grabbed();
        };

        var onGrab = function onGrab(_ref) {
          var target = _ref.target;

          updateGrabState(target);
        };

        var onFree = onGrab;

        var onDrag = function onDrag(_ref2) {
          var target = _ref2.target;

          var p = getNodePositionData(target, s);
          var tp = target.position();

          p.x = tp.x;
          p.y = tp.y;
        };

        var listenToGrab = function listenToGrab(node) {
          node.on('grab', onGrab);
          node.on('free', onFree);
          node.on('drag', onDrag);
        };

        var unlistenToGrab = function unlistenToGrab(node) {
          node.removeListener('grab', onGrab);
          node.removeListener('free', onFree);
          node.removeListener('drag', onDrag);
        };

        var fit = function fit() {
          if (s.fit && s.animateContinuously) {
            s.cy.fit(s.padding);
          }
        };

        var onNotDone = function onNotDone() {
          refreshPositions(s.nodes, s);
          fit();

          requestAnimationFrame(_frame);
        };

        var _frame = function _frame() {
          multitick(s, onNotDone, _onDone);
        };

        var _onDone = function _onDone() {
          refreshPositions(s.nodes, s);
          fit();

          s.nodes.forEach(function (n) {
            regrabify(n);
            unlistenToGrab(n);
          });

          s.running = false;

          l.emit('layoutstop');
        };

        l.emit('layoutstart');

        s.nodes.forEach(function (n) {
          ungrabify(n);
          listenToGrab(n);
        });

        _frame(); // kick off
      } else {
        var done = false;
        var _onNotDone = function _onNotDone() {};
        var _onDone2 = function _onDone2() {
          return done = true;
        };

        while (!done) {
          multitick(s, _onNotDone, _onDone2);
        }

        s.eles.layoutPositions(this, s, function (node) {
          var pd = getNodePositionData(node, s);

          return { x: pd.x, y: pd.y };
        });
      }

      l.postrun(s);

      return this; // chaining
    }
  }, {
    key: 'prerun',
    value: function prerun() {}
  }, {
    key: 'postrun',
    value: function postrun() {}
  }, {
    key: 'tick',
    value: function tick() {}
  }, {
    key: 'stop',
    value: function stop() {
      this.state.running = false;

      return this; // chaining
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      return this; // chaining
    }
  }]);

  return Layout;
}();

module.exports = Layout;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (bb, cy) {
  if (bb == null) {
    bb = { x1: 0, y1: 0, w: cy.width(), h: cy.height() };
  } else {
    // copy
    bb = { x1: bb.x1, x2: bb.x2, y1: bb.y1, y2: bb.y2, w: bb.w, h: bb.h };
  }

  if (bb.x2 == null) {
    bb.x2 = bb.x1 + bb.w;
  }
  if (bb.w == null) {
    bb.w = bb.x2 - bb.x1;
  }
  if (bb.y2 == null) {
    bb.y2 = bb.y1 + bb.h;
  }
  if (bb.h == null) {
    bb.h = bb.y2 - bb.y1;
  }

  return bb;
};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assign = __webpack_require__(2);

var setInitialPositionState = function setInitialPositionState(node, state) {
  var p = node.position();
  var bb = state.currentBoundingBox;
  var scratch = node.scratch(state.name);

  if (scratch == null) {
    scratch = {};

    node.scratch(state.name, scratch);
  }

  assign(scratch, state.randomize ? {
    x: bb.x1 + Math.round(Math.random() * bb.w),
    y: bb.y1 + Math.round(Math.random() * bb.h)
  } : {
    x: p.x,
    y: p.y
  });

  scratch.locked = node.locked();
};

var getNodePositionData = function getNodePositionData(node, state) {
  return node.scratch(state.name);
};

var refreshPositions = function refreshPositions(nodes, state) {
  nodes.positions(function (node) {
    var scratch = node.scratch(state.name);

    return {
      x: scratch.x,
      y: scratch.y
    };
  });
};

module.exports = { setInitialPositionState: setInitialPositionState, getNodePositionData: getNodePositionData, refreshPositions: refreshPositions };

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var nop = function nop() {};

var tick = function tick(state) {
  var s = state;
  var l = state.layout;

  var tickIndicatesDone = l.tick(s);

  if (s.firstUpdate) {
    if (s.animateContinuously) {
      // indicate the initial positions have been set
      s.layout.emit('layoutready');
    }
    s.firstUpdate = false;
  }

  s.tickIndex++;

  var duration = Date.now() - s.startTime;

  return !s.infinite && (tickIndicatesDone || s.tickIndex >= s.maxIterations || duration >= s.maxSimulationTime);
};

var multitick = function multitick(state) {
  var onNotDone = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : nop;
  var onDone = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : nop;

  var done = false;
  var s = state;

  for (var i = 0; i < s.refresh; i++) {
    done = !s.running || tick(s);

    if (done) {
      break;
    }
  }

  if (!done) {
    onNotDone();
  } else {
    onDone();
  }
};

module.exports = { tick: tick, multitick: multitick };

/***/ })
/******/ ]);
});