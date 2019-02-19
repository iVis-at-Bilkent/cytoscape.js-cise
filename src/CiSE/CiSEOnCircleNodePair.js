// -----------------------------------------------------------------------------
// Section: Constructors and initializations
// -----------------------------------------------------------------------------

function CiSEOnCircleNodePair(first, second, displacement, inSameDirection)
{
    if(first.getOnCircleNodeExt() !== null && second.getOnCircleNodeExt() != null)
    {
        throw "the nodes in a pair must be onCircle nodes!!"
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
CiSEOnCircleNodePair.prototype.compareTo = function(other)
{
    return Math.trunc(this.getDiscrepancy() - other.getDiscrepancy()); // TODO check
};

CiSEOnCircleNodePair.prototype.swap = function()
{
    this.getFirstNode().getOnCircleNodeExt().swapWith(
      this.getSecondNode().getOnCircleNodeExt());
};

// TODO check correctness especially node.equals function
CiSEOnCircleNodePair.prototype.equals = function(other)
{
    let self = this;

    let result = other instanceof CiSEOnCircleNodePair;

    if(result)
    {
        result &= (this.firstNode.equals(pair.getFirstNode()) &&
            this.secondNode.equals(pair.getSecondNode())) ||
            (this.secondNode.equals(pair.getFirstNode()) &&
                this.firstNode.equals(pair.getSecondNode()));
    }

    return result;
};

// TODO check correctness
CiSEOnCircleNodePair.prototype.hashCode = function()
{
    return this.firstNode.hashCode() + this.secondNode.hashCode();
};

CiSEOnCircleNodePair.prototype.toString = function()
{
    let result = "Swap: " + this.getFirstNode().label;
    result += "<->"+ this.getSecondNode().label;
    result +=", "+ this.getDiscrepancy();

    return result;
};

module.exports = CiSEOnCircleNodePair;









