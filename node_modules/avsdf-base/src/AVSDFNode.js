/**
 * This class implements data and functionality required for AVSDF layout per
 * node.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

let LNode = require('layout-base').LNode;
let Quicksort = require('layout-base').Quicksort;

// -----------------------------------------------------------------------------
// Section: Initializations
// -----------------------------------------------------------------------------

function AVSDFNode(gm, vNode, loc, size)
{
    // Constructor 1: AVSDFNode(gm, vNode, loc, size)
    if(loc !== undefined && size !== undefined)
    {
        LNode.call(this, gm, vNode, loc, size);
    }
    // Constructor 2: AVSDFNode(gm, vNode)
    else
    {
        LNode.call(this, gm, vNode);
    }

	// Angle of this node on the owner circle in radians
    this.angle = 0;

    // Index of this node on the owner circle
    this.circleIndex = -1;

    // Total number of crossings of the edges this node is incident to
    this.totalCrossingOfEdges = -1;

    // Whether the current edge crossing number is valid or it needs to be
    // recalculated
    this.isCrossingNumberValid = false;

}

AVSDFNode.prototype = Object.create(LNode.prototype);
for (let properties in LNode)
{
    AVSDFNode[properties] = LNode[properties];
}

// -----------------------------------------------------------------------------
// Section: Accessor Functions
// -----------------------------------------------------------------------------

// This function returns the circle this node is owned by.
AVSDFNode.prototype.getCircle = function()
{
    return this.getOwner();
};

// This function sets the index of this node on the circle, and sets the
// crossing number invalid. Due to the index change of the node; it needs to
// be recalculated.
AVSDFNode.prototype.setIndex = function(index)
{
    this.circleIndex = index;
    this.isCrossingNumberValid = false;
};

// This function returns the index of this node in the ordering of its owner
// circle. Here -1 means that the vertex is not yet placed on its owner
//circle.
AVSDFNode.prototype.getIndex = function()
{
    return this.circleIndex;
};

// This function returns the array of the neigbors of this node sorted in
// ascending order.
AVSDFNode.prototype.getNeighborsSortedByDegree = function()
{
    let  self = this;

    let result = Array.from(self.getNeighborsList());
    result = result.filter( node => ( node.getIndex() === -1 ) );

    result.sort(function(a,b){
        return a.getDegree() - b.getDegree();
    });

    return result;
};

// This function returns the degree of this node.
AVSDFNode.prototype.getDegree = function()
{
    return this.getEdges().length;
};

// This function returns whether or not this node is currently placed on its
// owner circle.
AVSDFNode.prototype.isOrdered =  function()
{
    return (this.getIndex() > -1);
};

// This function sets the angle of this node w.r.t. its owner circle. Here
// the angle value is in radian.
AVSDFNode.prototype.setAngle = function(angle)
{
    this.angle = angle;
};

// This function returns the angle of this node w.r.t. its owner circle. Here
// the angle value is in radian.
AVSDFNode.prototype.getAngle = function()
{
    return this.angle;
};

// This function returns the index difference of this node with the input
// node. Note that the index difference cannot be negative if both nodes are
// placed on the circle. Here -1 means at least one of the nodes are not yet
// placed on the circle.
AVSDFNode.prototype.getCircDistWithTheNode =  function(refNode)
{
    let self = this;
    let otherIndex = refNode.getIndex();
    
    if(otherIndex === -1 || self.getIndex() === -1)
    {
        return -1;
    }

    let diff = self.getIndex() - otherIndex;

    if(diff < 0)
    {
        diff += self.getCircle().getSize();
    }

    return diff;
};

// This function finds the number of edge crossings between the edges of
// this node and the edges of the input one.
AVSDFNode.prototype.getCrossingNumberWithNode =  function(otherNode)
{
    let self = this;
    let totalCrossing = 0;

    self.getEdges().forEach(
        function(edge)
        {
            otherNode.getEdges().forEach(
                function(otherEdge)
                {
                    totalCrossing += edge.crossingWithEdge(otherEdge);
                }
            );
        }
    );

    return totalCrossing;
};

// This function returns the total number of edge crossings. If the previously
// calculated value is not valid due to an index change on the circle, then
// a recalculation is performed.
AVSDFNode.prototype.getTotalCrossingOfEdges = function()
{
    let self = this;
    
    if(!self.isCrossingNumberValid)
    {
        self.calculateTotalCrossing();
        self.isCrossingNumberValid = true;

    }

    return self.totalCrossingOfEdges;
};


// -----------------------------------------------------------------------------
// Section: Remaining Functions
// -----------------------------------------------------------------------------

// This function calculates the total number of crossings the edges of this
// node cause.
AVSDFNode.prototype.calculateTotalCrossing = function()
{
    let self = this;
    let temp_crossing_count = 0;
    let temp_edge_list = [];
    temp_edge_list.push.apply(temp_edge_list, self.getCircle().getEdges());
    temp_edge_list = temp_edge_list.filter( (ele) => self.getEdges().indexOf(ele) < 0);

    self.getEdges().forEach(
        (edge) => temp_crossing_count += edge.calculateTotalCrossingWithList(temp_edge_list)
    );

    self.totalCrossingOfEdges = temp_crossing_count;
};

module.exports = AVSDFNode;