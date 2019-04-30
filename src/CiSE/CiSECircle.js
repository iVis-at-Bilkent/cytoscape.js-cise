/**
 * This class implements data and functionality required for CiSE layout per
 * cluster.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

let LGraph = require('avsdf-base').layoutBase.LGraph;
let HashSet = require('avsdf-base').layoutBase.HashSet;
let IGeometry = require('avsdf-base').layoutBase.IGeometry;
let Quicksort = require('avsdf-base').layoutBase.Quicksort;

let CircularForce = require('./CircularForce');
let CiSEConstants = require('./CiSEConstants');
let CiSEInterClusterEdgeInfo = require('./CiSEInterClusterEdgeInfo');


function CiSECircle(parent, graphMgr, vNode)
{
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

for ( let prop in LGraph )
{
    CiSECircle[prop] = LGraph[prop];
}

// -----------------------------------------------------------------------------
// Section: Accessors and mutators
// -----------------------------------------------------------------------------
// This method returns the radius of this circle.
CiSECircle.prototype.setRadius = function(radius)
{
    this.radius = radius;
};

// This method sets the radius of this circle.
CiSECircle.prototype.getRadius = function()
{
    return this.radius;
};

// This method returns nodes that don't have neighbors outside this circle.
CiSECircle.prototype.getInNodes = function()
{
    return this.inNodes;
};

// This method returns nodes that have neighbors outside this circle.
CiSECircle.prototype.getOutNodes = function()
{
    return this.outNodes;
};

// This method returns nodes that don't have neighbors outside this circle.
CiSECircle.prototype.getOnCircleNodes = function()
{
    return this.onCircleNodes;
};

// This method returns nodes that don't have neighbors outside this circle.
CiSECircle.prototype.getInCircleNodes = function()
{
    return this.inCircleNodes;
};

// This method calculates and sets dimensions of the parent node of this
// circle. Parent node is centered to be at the same location of the
// associated circle but its dimensions are larger than the circle by a
// factor (must be >= 1 to ensure all nodes are enclosed within its
// rectangle) of the largest dimension (width or height) of on-circle nodes
// so that it completely encapsulates the nodes on this circle.
CiSECircle.prototype.calculateParentNodeDimension = function()
{
    let self = this;

    let maxOnCircleNodeDimension = Number.MIN_SAFE_INTEGER;

    for(let i = 0; i < this.onCircleNodes.length; i++){
        let node = this.onCircleNodes[i];

        if(node.getWidth() > maxOnCircleNodeDimension)
        {
            maxOnCircleNodeDimension = node.getWidth();
        }
        if (node.getHeight() > maxOnCircleNodeDimension)
        {
            maxOnCircleNodeDimension = node.getHeight();
        }
    }

    let dimension = 2.0 * (self.radius + 15) + maxOnCircleNodeDimension;
    let parentNode = self.getParent();
    parentNode.setHeight(dimension);
    parentNode.setWidth(dimension);
};

module.exports = CiSECircle;