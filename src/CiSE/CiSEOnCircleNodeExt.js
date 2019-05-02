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