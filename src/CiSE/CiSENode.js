let FDLayoutNode = require('layout-base').FDLayoutNode;
let IMath = require('layout-base').IMath;
let CiSEConstants = require('./CiSEConstants');
let CiSEOnCircleNodeExt = require('./CiSEOnCircleNodeExt');


function CiSENode(gm, loc, size, vNode)
{
    // the constructor of LNode handles alternative constructors
    FDLayoutNode.call( this, gm, loc, size, vNode);
    this.onCircleNodeExt = null;
    this.rotationAmount = null;
}

CiSENode.prototype = Object.create(FDLayoutNode.prototype)

for (let prop in FDLayoutNode)
{
    CiSENode[prop] = FDLayoutNode[prop];
}

// -----------------------------------------------------------------------------
// Section: Accessors and mutators
// -----------------------------------------------------------------------------

// This method limits the input displacement with the maximum possible.
CiSENode.prototype.getLimitedDisplacement = function(displacement)
{
    if ( Math.abs(displacement) > CiSEConstants.MAX_NODE_DISPLACEMENT)
    {
        displacement = CiSEConstants.MAX_NODE_DISPLACEMENT * IMath.sign(displacement);
    }

    return displacement;
};

// This method returns the extension of this node for on-circle nodes. This
// extension is null if this node is a non-on-circle node.
CiSENode.prototype.getOnCircleNodeExt = function()
{
    return this.onCircleNodeExt;
};

// This method returns neighbors of this node which are on-circle, not
// in-circle.
CiSENode.prototype.getOnCircleNeighbors = function()
{
    let self = this;
    let neighbors = self.getNeighborsList();

    neighbors.forEach(
        function(neighbor)
        {
            if (neighbor.getOnCircleNodeExt() == null || neighbor.getClusterID() !== self.getClusterID() )
            {
                neighbors.remove(neighbor); // TODO check possible error.
            }
        }
    );

    return neighbors
};

// This method sets this node as an on-circle node by creating an extension
// for it.
CiSENode.prototype.setAsOnCircleNode = function()
{
    if ( this.onCircleNodeExt !== null )
    {
        throw 'CiSE node already has on circle node extension';
    }
    else
    {
        this.onCircleNodeExt = new CiSEOnCircleNodeExt(this);
        return this.onCircleNodeExt;
    }
};

// This method sets this node as an non on-circle node by deleting the
// extension for it.
CiSENode.prototype.setAsNonOnCircleNode = function()
{
    if ( this.onCircleNodeExt === null )
    {
        throw 'Attempt of removing null on circle node extension of CiSENode';
    }
    else
    {
        this.onCircleNodeExt = null;
    }
};

// This method returns the number of children (weight) of this node.
// If it is a compound, then return the number of simple nodes inside,
// otherwise return 1.
CiSENode.prototype.getNoOfChildren = function()
{
    if (this.getChild() === null) {
        return 1;
    }
    else {
        if(this.getChild().getNodes().size() <= 0)
        {
            throw 'CiSENode children size <= 0 when it is not supposed to';
        } //TODO check correctness
        return this.getChild().getNodes().size();
    }
};

// -----------------------------------------------------------------------------
// Section: Remaining methods
// -----------------------------------------------------------------------------

// This method moves this node as a result of the computations at the end of
// this iteration.
CiSENode.prototype.move = function()
{
    let self = this;

    let layout = self.getOwner().getGraphManager().getLayout();

    self.displacementX = self.getLimitedDisplacement(self.displacementX);
    self.displacementY = self.getLimitedDisplacement(self.displacementY);

    // First propogate movement to children if it's a circle
    if (self.getChild() !== null)
    {
        // Take size into account when reflecting total force into movement!
        let noOfNodesOnCircle = self.getChild().getNodes().size();

        self.displacementX /= noOfNodesOnCircle;
        self.displacementY /= noOfNodesOnCircle;

        if(noOfNodesOnCircle < 2)
        {
            throw 'The number of nodes on the circle must be greater than 1';
        }

        self.getChild().getNodes().forEach(
            function(node)
            {
                node.moveBy(this.displacementX, this.displacementY);
                layout.totalDisplacement +=
                    Math.abs(self.displacementX) + Math.abs(self.displacementY);
            }
        );
    }
};

// This method resets displacement values
CiSENode.prototype.reset = function()
{
    this.displacementX = 0.0;
    this.displacementY = 0.0;
};

module.exports = CiSENode;