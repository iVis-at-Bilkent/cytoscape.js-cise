/**
 * This class implements data and functionality required for CiSE layout per
 * edge.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

let FDLayoutEdge = require('avsdf-base').layoutBase.FDLayoutEdge;

// -----------------------------------------------------------------------------
// Section: Constructors and initialization
// -----------------------------------------------------------------------------

// Constructor
function CiSEEdge(source, target, vEdge)
{
    FDLayoutEdge.call(this, source, target, vEdge);

    /**
     * Flag for inter-graph edges in the base is not good enough. So we define
     * this one to mean: a CiSE edge is intra-cluster only if both its ends are
     * on a common circle; not intra-cluster, otherwise!
     */
    this.isIntraCluster = true;
}

CiSEEdge.prototype = Object.create(FDLayoutEdge.prototype);

for(let property in FDLayoutEdge)
{
    CiSEEdge[property] = FDLayoutEdge[property];
}

CiSEEdge.prototype.isIntraEdge = function(){
    return this.isIntraCluster;
};


// -----------------------------------------------------------------------------
// Section: Remaining methods
// -----------------------------------------------------------------------------

/**
 * This method checks whether this edge crosses with the input edge. It
 * returns false, if any of the vertices those edges are incident to are
 * not yet placed on the circle.
 */
CiSEEdge.prototype.crossesWithEdge = function(other){
    let result = false;
    let sourceExt = this.getSource().getOnCircleNodeExt();
    let targetExt = this.getTarget().getOnCircleNodeExt();
    let otherSourceExt = other.getSource().getOnCircleNodeExt();
    let otherTargetExt = other.getTarget().getOnCircleNodeExt();
    let sourcePos = -1;
    let targetPos = -1;
    let otherSourcePos = -1;
    let otherTargetPos = -1;

    if (sourceExt !== null)
        sourcePos = sourceExt.getIndex();

    if (targetExt !== null)
        targetPos = targetExt.getIndex();

    if (otherSourceExt !== null)
        otherSourcePos = otherSourceExt.getIndex();

    if (otherTargetExt !== null)
        otherTargetPos = otherTargetExt.getIndex();

    if ( !this.isInterGraph && !other.isInterGraph ){
        if (this.source.getOwner() !== this.target.getOwner())
            result = false;
        else
        {
            // if any of the vertices those two edges are not yet placed
            if (sourcePos === -1 || targetPos === -1 || otherSourcePos === -1 || otherTargetPos === -1)
                result = false;

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

/**
 * This method calculates the total number of crossings of this edge with
 * all the edges given in the input list.
 */
CiSEEdge.prototype.calculateTotalCrossingWithList = function(edgeList){
    let totalCrossing = 0;
    for(let i = 0; i < edgeList.length; i++)
        totalCrossing += this.crossingWithEdge(edgeList[i]);

    return totalCrossing;
};

/**
 * This method returns 1 if this edge crosses with the input edge, 0
 * otherwise.
 */
CiSEEdge.prototype.crossingWithEdge = function (other) {
    let crosses = this.crossesWithEdge(other);
    let result = 0;

    if (crosses)
        result = 1;

    return result;
};

module.exports = CiSEEdge;