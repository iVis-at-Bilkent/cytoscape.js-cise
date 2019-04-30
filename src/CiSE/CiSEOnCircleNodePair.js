/**
 * This class implements a pair of on-circle nodes used for swapping in phase 4.
 *
 */

// -----------------------------------------------------------------------------
// Section: Constructors and initializations
// -----------------------------------------------------------------------------

function CiSEOnCircleNodePair(first, second, displacement, inSameDirection)
{
    if(first.getOnCircleNodeExt() !== null && second.getOnCircleNodeExt() != null)
    {
        throw "the nodes in a pair must be onCircle nodes!!";
    }

    // The node of the pair which comes first in the ordering of its owner
    // circle.
    this.firstNode = first;

    // The node of the pair which comes second in the ordering of its owner
    // circle.
    this.secondNode = second;

    // The discrepancy of the displacement values of two nodes, indicating the
    // swapping potential of the two nodes. Higher value means that nodes are
    // more inclined to swap.
    this.discrepancy = displacement;

    // Whether or not the two nodes are pulling in the same direction
    this.inSameDir = inSameDirection;

}

CiSEOnCircleNodePair.prototype = Object.create;

// -----------------------------------------------------------------------------
// Section: Accessors
// -----------------------------------------------------------------------------

CiSEOnCircleNodePair.prototype.getDiscrepancy = function()
{
    return this.discrepancy;
};

CiSEOnCircleNodePair.prototype.inSameDirection = function()
{
    return this.inSameDir;
};

CiSEOnCircleNodePair.prototype.getFirstNode = function()
{
    return this.firstNode;
};

CiSEOnCircleNodePair.prototype.getSecondNode = function()
{
    return this.secondNode;
};


// -----------------------------------------------------------------------------
// Section: Remaining methods
// -----------------------------------------------------------------------------


module.exports = CiSEOnCircleNodePair;









