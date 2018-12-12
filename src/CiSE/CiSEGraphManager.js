let LGraphManager = require('layout-base').LGraphManager;
let Layout = require('layout-base').Layout;

// -----------------------------------------------------------------------------
// Section: Constructors and initialization
// -----------------------------------------------------------------------------

function CiSEGraphManager( layout )
{
    if(layout !== undefined)
    {
        LGraphManager.call(this, layout);
    }

    // Instance Variables

    /**
     * All on-circle and other nodes (unclustered nodes and nodes representing
     * each cluster/circle) in this graph manager. For efficiency purposes we
     * hold references of these nodes that we operate on in arrays.
     */

    this.onCircleNodes = undefined;
    this.inCircleNodes = undefined;
    this.nonOnCircleNodes = undefined;
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
    if(this.onCircleNodes === undefined)
    {
        throw "onCircleNodes is not initialized";
    }

    return this.onCircleNodes;
};

// This method returns an array of all in-circle nodes.
CiSEGraphManager.prototype.getInCircleNodes = function()
{
    if(this.inCircleNodes === undefined)
    {
        throw "inCircleNodes is not initialized";
    }

    return this.inCircleNodes;
};

// This method returns an array of all nodes other than on-circle nodes.
CiSEGraphManager.prototype.getNonOnCircleNodes = function()
{
    if(this.nonOnCircleNodes === undefined)
    {
        throw "nonOnCircleNodes is not initialized";
    }

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