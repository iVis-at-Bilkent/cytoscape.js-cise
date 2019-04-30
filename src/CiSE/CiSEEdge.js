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



// -----------------------------------------------------------------------------
// Section: Remaining methods
// -----------------------------------------------------------------------------



module.exports = CiSEEdge;