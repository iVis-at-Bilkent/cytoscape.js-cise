let LNode = require('layout-base').LNode;
let FDLayoutEdge = require('layout-base').FDLayoutEdge;

// -----------------------------------------------------------------------------
// Section: Constructors and initialization
// -----------------------------------------------------------------------------

// Constructor
function CiSEEdge(source, target, vEdge)
{
    FDLayoutEdge.call(this, source, target, vEdge);
    this.isIntraCluster = true;
}

CiSEEdge.prototype = Object.create(FDLayoutEdge.prototype);

for(let property in FDLayoutEdge)
{
    CiSEEdge[property] = FDLayoutEdge[property];
}

// -----------------------------------------------------------------------------
// Section: Remaining methods
// -----------------------------------------------------------------------------

// This method checks whether this edge crosses with the input edge.
// It returns false, if any of the vertices those edges are incident
// to are not yet placed on the circle.
CiSEEdge.prototype.crossesWithEdge = function(other)
{
    let self = this;

    let result = false;
    let sourceExt = self.source.getOnCircleNodeExt();
    let targetExt = self.target.getOnCircleNodeExt();
    let otherSourceExt = other.source.getOnCircleNodeExt();
    let otherTargetExt = other.target.getOnCircleNodeExt();
    let sourcePos = -1;
    let targetPos = -1;
    let otherSourcePos = -1;
    let otherTargetPos = -1;

    if (sourceExt != null)
    {
        sourcePos = sourceExt.getIndex();
    }

    if (targetExt != null)
    {
        targetPos = targetExt.getIndex();
    }

    if (otherSourceExt != null)
    {
        otherSourcePos = otherSourceExt.getIndex();
    }

    if (otherTargetExt != null)
    {
        otherTargetPos = otherTargetExt.getIndex();
    }

    if (!self.isInterGraph && !other.isInterGraph)
    {
        if (self.source.getOwner() !== self.target.getOwner())
        {
            result = false;
        }
        else
        {
            // if any of the vertices those two edges are not yet placed
            if (sourcePos === -1 || targetPos === -1 ||
                otherSourcePos === -1 || otherTargetPos === -1)
            {
                result = false;
            }

            let otherSourceDist = otherSourceExt.getCircDistWithTheNode(sourceExt);
            let otherTargetDist = otherTargetExt.getCircDistWithTheNode(sourceExt);
            let thisTargetDist = targetExt.getCircDistWithTheNode(sourceExt);

            if (thisTargetDist < Math.max(otherSourceDist, otherTargetDist) &&
                thisTargetDist > Math.min(otherSourceDist, otherTargetDist) &&
                otherTargetDist !== 0 && otherSourceDist !== 0)
            {
                result = true;
            }
        }
    }
    else
    {
        result = true;
    }

    return result;
};

// This method calculates the total number of crossings of this edge with
// all the edges given in the input list.
CiSEEdge.prototype.calculateTotalCrossingWithList = function(edgeList)
{
    let self = this;

    let totalCrossing = 0;

    edgeList.forEach(function(edge){
        totalCrossing += self.crossingWithEdge(edge);
    });

    return totalCrossing;
};

// This method returns 1 if this edge crosses with the input edge, 0
// otherwise.
CiSEEdge.prototype.crossingWithEdge = function(other)
{
    let self = this;

    let crosses = self.crossesWithEdge(other);

    if(crosses)
    {
        return 1;
    }
    else
    {
        return 0;
    }
};

module.exports = CiSEEdge;