/**
/**
 * This class implements data and functionality required for CiSE layout per
 * on-circle node. In other words, it is an extension to CiSENode class for
 * on-circle nodes.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

let IGeometry = require('avsdf-base').layoutBase.IGeometry;

// -----------------------------------------------------------------------------
// Section: Constructors and initializations
// -----------------------------------------------------------------------------


function CiSEOnCircleNodeExt(ciseNode)
{
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
CiSEOnCircleNodeExt.prototype.getCiseNode = function()
{
    return this.ciseNode;
};

// This function returns the relative position of this node
// within it's owner circle
CiSEOnCircleNodeExt.prototype.getAngle = function()
{
    return this.angle;
};

// This function sets the relative position of this node within its owner
// circle. We keep the angle positive for easy debugging.
CiSEOnCircleNodeExt.prototype.setAngle = function(angle)
{
    this.angle = angle % IGeometry.TWO_PI;
    if (this.angle < 0)
    {
        this.angle += IGeometry.TWO_PI;
    }
};

// This function returns current index of this in it's owner circle
CiSEOnCircleNodeExt.prototype.getIndex = function()
{
    return this.orderIndex;
};

// This function sets current index of this node in its owner circle.
CiSEOnCircleNodeExt.prototype.setIndex = function(index)
{
    this.orderIndex = index;
};

/**
 * This method returns the char code of this node based on the node index.
 * First node of the cluster is 'a', second one is 'b", and so on. We only
 * guarentee a unique char code up to 52 nodes in a cluster.
 *
 * Remember in ASCII, 'a' is 97 and 'A' is 65. In Unicode, 'A' has a bigger decimal value
 */
CiSEOnCircleNodeExt.prototype.getCharCode = function(){
    let charCode;

    if( this.orderIndex < 26)
        charCode = String.fromCharCode(97 + this.orderIndex);
    else if (this.orderIndex < 52)
        charCode = String.fromCharCode( 65 + this.orderIndex );
    else
        charCode = '?';

    return charCode;
};

/**
 * This method returns the next node according to current ordering of the
 * owner circle.
 */
CiSEOnCircleNodeExt.prototype.getNextNode = function(){
    let circle = this.ciseNode.getOwner();
    let totalNodes = circle.getOnCircleNodes().length;
    let nextNodeIndex = this.orderIndex + 1;

    if(nextNodeIndex === totalNodes)
        nextNodeIndex = 0;

    return circle.getOnCircleNodes()[nextNodeIndex];
};

/**
 * This method returns the previous node according to current ordering of
 * the owner circle.
 */
CiSEOnCircleNodeExt.prototype.getPrevNode = function(){
    let circle = this.ciseNode.getOwner();
    let nextNodeIndex = this.orderIndex - 1;

    if (nextNodeIndex === -1)
    {
        nextNodeIndex = circle.getOnCircleNodes().length - 1;
    }

    return circle.getOnCircleNodes()[nextNodeIndex];
};

/**
 * This method returns the extension of the next node according to current
 * ordering of the owner circle.
 */
CiSEOnCircleNodeExt.prototype.getNextNodeExt= function(){
    return this.getNextNode().getOnCircleNodeExt();
};

/**
 * This method returns the extension of the previous node according to
 * current ordering of the owner circle.
 */
CiSEOnCircleNodeExt.prototype.prevNextNodeExt = function(){
    return this.getPrevNode().getOnCircleNodeExt();
};

CiSEOnCircleNodeExt.prototype.canSwapWithNext = function(){
  return this.canSwapWithNext;
};

CiSEOnCircleNodeExt.prototype.canSwapWithPrev = function(){
    return this.canSwapWithPrev;
};

CiSEOnCircleNodeExt.prototype.getDisplacementForSwap = function(){
  return this.displacementForSwap;
};

CiSEOnCircleNodeExt.prototype.setDisplacementForSwap = function(displacementForSwap){
    this.displacementForSwap = displacementForSwap;
};

CiSEOnCircleNodeExt.prototype.addDisplacementForSwap = function(displacementIncrForSwap){
    this.displacementForSwap = displacementIncrForSwap;
    // This is what we intended (but above seems to work better):
    //		this.displacementForSwap = (this.displacementForSwap +
    //			displacementIncrForSwap) / 2.0;
};

// -----------------------------------------------------------------------------
// Section: Remaining methods
// -----------------------------------------------------------------------------

/**
 * This method updates the absolute position of this node with respect to
 * its angle and the position of node that owns the owner circle.
 */
CiSEOnCircleNodeExt.prototype.updatePosition = function(){
    let ownerGraph = this.ciseNode.getOwner();
    let parentNode = ownerGraph.getParent();

    let parentX = parentNode.getCenterX();
    let parentY = parentNode.getCenterY();

    let xDifference = ownerGraph.getRadius() * Math.cos(this.angle);
    let yDifference = ownerGraph.getRadius() * Math.sin(this.angle);

    this.ciseNode.setCenter(parentX + xDifference , parentY + yDifference);
};

/**
 * This method returns the index difference of this node with the input
 * node. Note that the index difference cannot be negative if both nodes are
 * placed on the circle. Here -1 means at least one of the nodes are not yet
 * placed on the circle.
 */
CiSEOnCircleNodeExt.prototype.getCircDistWithTheNode = function(refNode){
    let otherIndex = refNode.getIndex();

    if (otherIndex === -1 || this.getIndex() === -1)
    {
        return -1;
    }

    let diff = this.getIndex() - otherIndex;

    if (diff < 0)
    {
        diff += this.ciseNode.getOwner().getOnCircleNodes().length;
    }

    return diff;
};

/**
 * This method calculates the total number of crossings the edges of this
 * node cause.
 */
CiSEOnCircleNodeExt.prototype.calculateTotalCrossing = function() {
    let intraEdges = this.getIntraClusterEdges();
    let count = 0;
    let temp = [];

    this.ciseNode.getOwner().getIntraClusterEdges().forEach(function (edge) {
       temp.push(edge);
    });

    this.ciseNode.getEdges().forEach(function (edge) {
        let index = temp.indexOf(edge);
        if (index > -1) {
            temp.splice(index, 1);
        }
    });

    intraEdges.forEach(function (edge) {
       count += edge.calculateTotalCrossingWithList(temp);
    });

    return count;
};

/**
 * This method updates the conditions for swapping of this node with its
 * previous and next neighbors on the associated circle.
 */
CiSEOnCircleNodeExt.prototype.updateSwappingConditions = function(){
    // Current values
    let currentCrossingNumber = this.calculateTotalCrossing();
    let currentNodeIndex = this.orderIndex;

    // What will happen if node is swapped with next
    let nextNodeExt = this.getNextNode().getOnCircleNodeExt();
    this.orderIndex = nextNodeExt.getIndex();
    nextNodeExt.setIndex(currentNodeIndex);

    let tempCrossingNumber = this.calculateTotalCrossing();
    this.canSwapWithNext = tempCrossingNumber <= currentCrossingNumber;

    // Reset indices
    nextNodeExt.setIndex(this.orderIndex);
    this.setIndex(currentNodeIndex);

    // What will happen if node is swapped with prev
    let prevNodeExt = this.getPrevNode().getOnCircleNodeExt();
    this.orderIndex = prevNodeExt.getIndex();
    prevNodeExt.setIndex(currentNodeIndex);

    tempCrossingNumber = this.calculateTotalCrossing();
    this.canSwapWithPrevious = tempCrossingNumber <= currentCrossingNumber;

    // Reset indices
    prevNodeExt.setIndex(this.orderIndex);
    this.setIndex(currentNodeIndex);
};

/**
 * This method swaps this node with the specified neighbor (prev or next).
 */
CiSEOnCircleNodeExt.prototype.swapWith = function(neighborExt){
    this.ciseNode.getOwner().swapNodes(this.ciseNode, neighborExt.ciseNode);
};

/**
 * This method finds the number of crossings of inter cluster edges of this
 * node with the inter cluster edges of the other node.
 */
CiSEOnCircleNodeExt.prototype.getInterClusterIntersections = function(other) {
    let count = 0;

    let thisInterClusterEdges = this.getInterClusterEdges();
    let otherInterClusterEdges = other.getInterClusterEdges();

   for(let i = 0; i < thisInterClusterEdges.length; i++){
       let edge = thisInterClusterEdges[i];

       let point1 = this.ciseNode.getCenter();
       let point2 = edge.getOtherEnd(this.ciseNode).getCenter();

       for(let j = 0; j < otherInterClusterEdges.length; j++){
           let otherEdge = otherInterClusterEdges[j];
           let point3 = other.ciseNode.getCenter();
           let point4 = otherEdge.getOtherEnd(other.ciseNode).getCenter();

           if (edge.getOtherEnd(this.ciseNode) !== otherEdge.getOtherEnd(other.ciseNode))
           {
               let result = IGeometry.doIntersect(point1, point2, point3, point4);

               if (result)
                   count++;
           }
       }
   }

    return count;
};

/**
 * This method returns the inter cluster edges of the associated node.
 */
CiSEOnCircleNodeExt.prototype.getInterClusterEdges = function()
{
    if(this.interClusterEdges === null){ //first time accessing
        this.interClusterEdges = [];
        let edgesOfNode = this.ciseNode.getEdges();
        for(let i = 0; i < edgesOfNode.length; i++){
            let edge = edgesOfNode[i];
            if(!edge.isIntraCluster){
                this.interClusterEdges.push(edge);
            }
        }

    }

    return this.interClusterEdges;
};

/**
 * This method returns the intra cluster edges of the associated node.
 */
CiSEOnCircleNodeExt.prototype.getIntraClusterEdges = function()
{
    if(this.intraClusterEdges === null){ //first time accessing
        this.intraClusterEdges = [];
        let edgesOfNode = this.ciseNode.getEdges();
        for(let i = 0; i < edgesOfNode.length; i++){
            let edge = edgesOfNode[i];
            if(edge.isIntraCluster){
                this.intraClusterEdges.push(edge);
            }
        }
    }

    return this.intraClusterEdges;
};



module.exports = CiSEOnCircleNodeExt;