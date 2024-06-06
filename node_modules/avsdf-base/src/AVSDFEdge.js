/**
 * This class implements data and functionality required for AVSDF layout per
 * edge.
 *

 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

let LEdge = require('layout-base').LEdge;

// -----------------------------------------------------------------------------
// Section: Initializations
// -----------------------------------------------------------------------------

function AVSDFEdge(source, target, vEdge)
{
    LEdge.call(this, source,target, vEdge);
}

AVSDFEdge.prototype = Object.create(LEdge.prototype);

for (let properties in LEdge)
{
    AVSDFEdge[properties] = LEdge[properties];
}

// -----------------------------------------------------------------------------
// Section: Accessor Functions
// -----------------------------------------------------------------------------

// The function getOtherEnd returns the other end of this edge.
AVSDFEdge.prototype.getOtherEnd = function(node)
{
    return LEdge.prototype.getOtherEnd(node);
};

// -----------------------------------------------------------------------------
// Section: Remaining Functions
// -----------------------------------------------------------------------------

// This function checks whether this edge crosses with the input edge. It
// returns false, if any of the vertices those edges are incident to are not
// yet placed on the circle.
AVSDFEdge.prototype.crossesWithEdge = function(otherEdge)
{
    let self = this;
    let sourcePos = self.getSource().getIndex();
    let targetPos = self.getTarget().getIndex();
    let otherSourcePos = otherEdge.getSource().getIndex();
    let otherTargetPos = otherEdge.getTarget().getIndex();
    
    // if any of the vertices those two edges are not yet placed
    if(sourcePos === -1 || targetPos === -1 || otherSourcePos === -1 || otherTargetPos === -1)
    {
        return false;
    }

    let otherSourceDist = otherEdge.getSource().getCircDistWithTheNode(self.getSource());
    let otherTargetDist = otherEdge.getTarget().getCircDistWithTheNode(self.getSource());
    let thisTargetDist = self.getTarget().getCircDistWithTheNode(self.getSource());

    if (thisTargetDist < Math.max(otherSourceDist, otherTargetDist) &&
            thisTargetDist > Math.min(otherSourceDist, otherTargetDist) &&
                otherTargetDist !== 0 && otherSourceDist !== 0)
    {
        return true;
    }

    return false;
};

// This function returns 1 if this edge crosses with the input edge, 0
// otherwise.
AVSDFEdge.prototype.crossingWithEdge = function(otherEdge)
{
    let self = this;
    let result = self.crossesWithEdge(otherEdge);

    return  result ? 1 : 0;
};

// This function calculates the total number of crossings of this edge with
// all the edges given in the input list.
AVSDFEdge.prototype.calculateTotalCrossingWithList = function(edgeList)
{
    let self = this;
    let totalCrossing = 0;

    edgeList.forEach(
        (edge) => totalCrossing += self.crossingWithEdge(edge)
    );

    return totalCrossing;
};

module.exports = AVSDFEdge;