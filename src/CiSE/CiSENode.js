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

    // Amount by which this node will be rotated in this iteration. Note that
    // clockwise rotation is positive and counter-clockwise is negative.
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

/**
 * This method sets this node as an on-circle node by creating an extension for it.
 */
CiSENode.prototype.setAsOnCircleNode = function()
{
    this.onCircleNodeExt = new CiSEOnCircleNodeExt(this);
    return this.onCircleNodeExt;
};

/**
 * This method sets this node as an non on-circle node by deleting the
 * extension for it.
 */
CiSENode.prototype.setAsNonOnCircleNode = function()
{
    this.onCircleNodeExt = null;
};

/**
 * This method returns the extension of this node for on-circle nodes. This
 * extension is null if this node is a non-on-circle node.
 */
CiSENode.prototype.getOnCircleNodeExt = function()
{
    return this.onCircleNodeExt;
};

/**
 * This method limits the input displacement with the maximum possible.
 */
CiSENode.prototype.getLimitedDisplacement = function( displacement ){
    if ( Math.abs(displacement) > CiSEConstants.MAX_NODE_DISPLACEMENT )
        displacement = CiSEConstants.MAX_NODE_DISPLACEMENT * IMath.sign(displacement);

    return displacement;
};

/**
 * This method returns neighbors of this node which are on-circle, not
 * in-circle.
 */
CiSENode.prototype.getOnCircleNeighbors = function(){
    let neighbors = Array.from(this.getNeighborsList());
    let onCircleNeighbors = [];

    for(let i = 0; i < neighbors.length; i++){
        let node = neighbors[i];

        if( node.getOnCircleNodeExt() !== null && node.getClusterId() === this.getClusterId() )
            onCircleNeighbors.push(node);
    }

   return onCircleNeighbors;
};

/**
 * This method returns the number of children (weight) of this node.
 * If it is a compound, then return the number of simple nodes inside,
 * otherwise return 1.
 */
CiSENode.prototype.getNoOfChildren = function () {
    if (this.getChild() === null || this.getChild() === undefined)
        return 1;
    else
        return this.getChild().getNodes().length;
};

// -----------------------------------------------------------------------------
// Section: Remaining methods
// -----------------------------------------------------------------------------

/**
 * This method moves this node as a result of the computations at the end of
 * this iteration.
 */
CiSENode.prototype.move = function (coolingFactor = 1) {
    let layout = this.getOwner().getGraphManager().getLayout();

    this.displacementX = this.getLimitedDisplacement(this.displacementX)*coolingFactor;
    this.displacementY = this.getLimitedDisplacement(this.displacementY)*coolingFactor;

    // First propagate movement to children if it's a circle
    if (this.getChild() !== null && this.getChild() !== undefined )
    {
        // Take size into account when reflecting total force into movement!
        let noOfNodesOnCircle = this.getChild().getNodes().length;
        this.displacementX /= noOfNodesOnCircle;
        this.displacementY /= noOfNodesOnCircle;

        let children = this.getChild().getNodes();

        for(let i = 0; i < children.length; i++) {
            let node = children[i];

            node.moveBy(this.displacementX, this.displacementY);
            layout.totalDisplacement += Math.abs(this.displacementX) + Math.abs(this.displacementY);
        }
    }

    this.moveBy(this.displacementX, this.displacementY);
    layout.totalDisplacement += Math.abs(this.displacementX) + Math.abs(this.displacementY);

    if (this.getChild() !== null && this.getChild() !== undefined )
    {
        this.getChild().updateBounds(true);
    }

};

/**
 * This method moves a nonOnCircleNode's all inCircle children when
 * it's dimension(width and height) is changed. It should only be called
 * when the additional node seperation of the child circle is increased, which
 * increases the dimension of the parent non-oncircle node and slightly changes its center.
 * The small change in center of this non-oncircle node should be reflected to
 * it's children immediately and before displacements caused by forces are applied.
 */
CiSENode.prototype.reflectCenterChangeToChildren = function (oldX,oldY) {
    
    if (this.getChild() !== null && this.getChild() !== undefined )
    {
        let inCircleNodes = this.getChild().getInCircleNodes();
        let centerX = this.getCenterX();
        let centerY = this.getCenterY();
        
        for(let i = 0; i < inCircleNodes.length; i++) {
            let node = inCircleNodes[i];
            node.moveBy(centerX-oldX, centerY-oldY);
        }
    }

}

/**
 * This method moves this inner node as a result of the computations at the end of
 * this iteration. However, as the displacement can be limited because of the inner boundaries,
 * to let layout continue, unabated displacement is reflected to layout's total displacement.
 */
CiSENode.prototype.innerMove = function (displacementRequestX, displacementRequestY,coolingFactor = 1) {
    let layout = this.getOwner().getGraphManager().getLayout();

    this.displacementX = this.getLimitedDisplacement(this.displacementX)*coolingFactor;
    this.displacementY = this.getLimitedDisplacement(this.displacementY)*coolingFactor;

    this.moveBy(this.displacementX, this.displacementY);
    layout.totalDisplacement += Math.abs(this.getLimitedDisplacement(displacementRequestX)) 
                                + Math.abs(this.getLimitedDisplacement(displacementRequestY));

};

/**
 * This method resets displacement values
 */
CiSENode.prototype.reset = function()
{
    this.displacementX = 0.0;
    this.displacementY = 0.0;
};

module.exports = CiSENode;