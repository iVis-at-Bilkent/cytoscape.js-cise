/**
 * This class implements data and functionality required for CiSE layout per
 * node.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

let FDLayoutNode = require('avsdf-base').layoutBase.FDLayoutNode;
let IMath = require('avsdf-base').layoutBase.IMath;
let CiSEConstants = require('./CiSEConstants');
let CiSEOnCircleNodeExt = require('./CiSEOnCircleNodeExt');

function CiSENode(gm, loc, size, vNode)
{
    // the constructor of LNode handles alternative constructors
    FDLayoutNode.call( this, gm, loc, size, vNode);

    /**
     * Amount by which this node will be rotated in this iteration. Note that
     * clockwise rotation is positive and counter-clockwise is negative.
     */
    this.rotationAmount = null;

    // Extension for on-circle nodes
    this.onCircleNodeExt = null; //Extension for on-circle nodes

    // Cluster ID which the node belongs to
    this.clusterID = null;

    // Cytoscape node ID for transforming between layout and cytoscape
    this.ID = null;
}

CiSENode.prototype = Object.create(FDLayoutNode.prototype);

for (let prop in FDLayoutNode)
{
    CiSENode[prop] = FDLayoutNode[prop];
}

// -----------------------------------------------------------------------------
// Section: Accessors and mutators
// -----------------------------------------------------------------------------

// This method resets displacement values
CiSENode.prototype.reset = function()
{
    this.displacementX = 0.0;
    this.displacementY = 0.0;
};

CiSENode.prototype.setClusterId = function(cID){
    this.clusterID = cID;
};

CiSENode.prototype.getClusterId = function(){
    return this.clusterID;
};

CiSENode.prototype.setId = function(ID){
    this.ID = ID;
};

CiSENode.prototype.getId = function(){
    return this.ID;
};

// This method sets this node as an on-circle node by creating an extension for it.
CiSENode.prototype.setAsOnCircleNode = function()
{
    this.onCircleNodeExt = new CiSEOnCircleNodeExt(this);
    return this.onCircleNodeExt;
};

// This method sets this node as an non on-circle node by deleting the
// extension for it.
CiSENode.prototype.setAsNonOnCircleNode = function()
{
    this.onCircleNodeExt = null;
};

// This method returns the extension of this node for on-circle nodes. This
// extension is null if this node is a non-on-circle node.
CiSENode.prototype.getOnCircleNodeExt = function()
{
    return this.onCircleNodeExt;
};


module.exports = CiSENode;