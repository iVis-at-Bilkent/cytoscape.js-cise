/**
 * This class implements a graph-manager for CiSE layout specific data and
 * functionality.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

let LGraphManager = require('avsdf-base').layoutBase.LGraphManager;

// -----------------------------------------------------------------------------
// Section: Constructors and initialization
// -----------------------------------------------------------------------------

function CiSEGraphManager( layout )
{
    LGraphManager.call(this, layout);

    /**
     * All on-circle and other nodes (unclustered nodes and nodes representing
     * each cluster/circle) in this graph manager. For efficiency purposes we
     * hold references of these nodes that we operate on in arrays.
     */

    this.onCircleNodes = [];
    this.inCircleNodes = [];
    this.nonOnCircleNodes = [];
}

CiSEGraphManager.prototype = Object.create(LGraphManager.prototype);

for(let property in LGraphManager)
{
    CiSEGraphManager[property] = LGraphManager[property];
}

// -----------------------------------------------------------------------------
// Section: Accessors
// -----------------------------------------------------------------------------

// This method returns an array of all on-circle nodes.
CiSEGraphManager.prototype.getOnCircleNodes = function()
{
    return this.onCircleNodes;
};

// This method returns an array of all in-circle nodes.
CiSEGraphManager.prototype.getInCircleNodes = function()
{
    return this.inCircleNodes;
};

// This method returns an array of all nodes other than on-circle nodes.
CiSEGraphManager.prototype.getNonOnCircleNodes = function()
{
    return this.nonOnCircleNodes;
};

// This method sets the array of all on-circle nodes.
CiSEGraphManager.prototype.setOnCircleNodes = function(nodes)
{
    this.onCircleNodes = nodes;
};

// This method sets the array of all in-circle nodes.
CiSEGraphManager.prototype.setInCircleNodes = function(nodes)
{
    this.inCircleNodes = nodes;
};

// This method sets the array of all nodes other than on-circle nodes.
CiSEGraphManager.prototype.setNonOnCircleNodes = function(nodes)
{
    this.nonOnCircleNodes = nodes;
};

module.exports = CiSEGraphManager;