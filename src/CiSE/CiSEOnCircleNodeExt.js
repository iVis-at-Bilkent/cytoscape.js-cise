//let LNode = require('layout-base').LNode;
let IGeometry = require('layout-base').IGeometry;


// -----------------------------------------------------------------------------
// Section: Constructors and initializations
// -----------------------------------------------------------------------------


function CiSEOnCircleNodeExt(ciseNode)
{
    // Associated CiSE node
    this.ciseNode = ciseNode;

    // Holds the intra-cluster edges of this node, initially it is null. It
    // will be calculated and stored when getIntraClusterEdges method is first
    // called.
    this.intraClusterEdges = null;

    // Holds the inter-cluster edges of this node, initially it is null. It
    // will be calculated and stored when getInterClusterEdges method is first
    // called.
    this.interClusterEdges = null;

    // Holds relative position of this node with respect to its owner circle
    // It is less than 0 (=-1) only if not assigned. Its unit is radian.
    this.angle = -1;

    // Holds current index of this node within its owner circle; it is -1 if not
    // assigned.
    this.orderIndex = -1;

    // Indicates whether a swapping with next node in the owner circle order
    // will cause no additional crossings or not.
    this.canSwapWithNext = null;

    // Indicates whether a swapping with previous node in the owner circle order
    // will cause no additional crossings or not.
    this.canSwapWithPrevious = null;

    // Holds the total weighted displacement value calculated over a constant
    // number of iterations used for deciding whether two nodes should be
    // swapped.
    this.displacementForSwap = null;
}

CiSEOnCircleNodeExt.prototype = Object.create();


// -----------------------------------------------------------------------------
// Section: Accessors and mutators
// -----------------------------------------------------------------------------


// This function returns the associated CiSENode
CiSEOnCircleNodeExt.prototype.getCiseNode = function()
{
    return this.ciseNode;
};

// This function returns the relative position of this node
// within it's owner circle
CiSEOnCircleNodeExt.prototype.getAngle = function()
{
    return this.angle;
};

// This function sets the relative position of this node within its owner
// circle. We keep the angle positive for easy debugging.
CiSEOnCircleNodeExt.prototype.setAngle = function(angle)
{
    this.angle = angle % IGeometry.TWO_PI;
    if (this.angle < 0)
    {
        this.angle += IGeometry.TWO_PI;
    }
};

// This function returns current index of this in it's owner circle
CiSEOnCircleNodeExt.prototype.getIndex = function()
{
    return this.orderIndex;
};

// This function sets current index of this node in its owner circle.
CiSEOnCircleNodeExt.prototype.setIndex = function(index)
{
    this.orderIndex = index;
};

// This function returns the char code of this node based on the node index.
// First node of the cluster is 'a', second one is 'b", and so on. We only
// guarentee a unique char code up to 52 nodes in a cluster.
CiSEOnCircleNodeExt.prototype.getCharCode = function() // TODO check for possible bug
{
    if( this.orderIndex < 0)
    {
        throw 'orderIndex is less than 0';
    }

    let charCode;

    if(this.orderIndex < 26)
    {
        charCode = String.fromCharCode('a'.charCodeAt(0) + this.orderIndex);
    }
    else if (this.orderIndex < 52)
    {
        charCode = String.fromCharCode('A'.charCodeAt(0) + this.orderIndex - 26);
    }
    else
    {
        charCode = '?'.charCodeAt(0);
    }

    return charCode;
};

// This function returns the next node according to current ordering of the
// owner circle.
CiSEOnCircleNodeExt.prototype.getNextNode = function()
{
    let circle = this.ciseNode.getOwner();
    let totalNodes = circle.getOnCircleNodes().length;
    let nextNodeIndex = this.orderIndex + 1;

    if (nextNodeIndex === totalNodes)
    {
        nextNodeIndex = 0;
    }

    return circle.getOnCircleNodes()[nextNodeIndex]; // TODO check here
};

// This function returns the previous node according to current ordering of
// the owner circle.
CiSEOnCircleNodeExt.prototype.getPrevNode = function()
{
    let circle = this.ciseNode.getOwner();
    let nextNodeIndex = this.orderIndex - 1;

    if (nextNodeIndex === -1)
    {
        nextNodeIndex = circle.getOnCircleNodes().length - 1;
    }

    return circle.getOnCircleNodes()[nextNodeIndex]; // TODO
};

// This function returns the extension of the next node according to current
// ordering of the owner circle.
CiSEOnCircleNodeExt.prototype.getNextNodeExt = function()
{
    return this.getNextNode().getOnCircleNodeExt();
};

// This function returns the extension of the previous node according to current
// ordering of the owner circle.
CiSEOnCircleNodeExt.prototype.getPrevNodeExt = function()
{
    return this.getPrevNode().getOnCircleNodeExt();
};

CiSEOnCircleNodeExt.prototype.canSwapWithNext = function()
{
    return this.canSwapWithNext;
};

CiSEOnCircleNodeExt.prototype.canSwapWithPrev = function()
{
    return this.canSwapWithPrevious;
};

CiSEOnCircleNodeExt.prototype.getDisplacementForSwap = function()
{
    return this.displacementForSwap;
};

CiSEOnCircleNodeExt.prototype.setDisplacementForSwap = function(displacementForSwap)
{
    this.displacementForSwap = displacementForSwap;
};

CiSEOnCircleNodeExt.prototype.addDisplacementForSwap = function(displacementIncrForSwap)
{
    this.displacementForSwap = displacementIncrForSwap;
    // This is what we intended (but above seems to work better):
    //		this.displacementForSwap = (this.displacementForSwap +
    //			displacementIncrForSwap) / 2.0;
};


// -----------------------------------------------------------------------------
// Section: Remaining methods
// -----------------------------------------------------------------------------

// This function updates the absolute position of this node with respect to
// its angle and the position of node that owns the owner circle.
CiSEOnCircleNodeExt.prototype.updatePosition = function()
{
    let ownerGraph = this.ciseNode.getOwner();
    let parentNode = ownerGraph.getParent();

    let parentX = parentNode.getCenterX();
    let parentY = parentNode.getCenterY();

    let xDifference = ownerGraph.getRadius() - Math.cos(this.angle);
    let yDifference = ownerGraph.getRadius() - Math.sin(this.angle);

    this.ciseNode.setCenter(parentX + xDifference, parentY + yDifference);
};

// This function returns the index difference of this node with the input
// node. Note that the index difference cannot be negative if both nodes are
// placed on the circle. Here -1 means at least one of the nodes are not yet
// placed on the circle.
CiSEOnCircleNodeExt.prototype.getCircDistWithNode = function(refnode)
{
    let otherIndex = refnode.getIndex();

    if( otherIndex === -1 || this.getIndex() === -1 )
    {
        return -1;
    }

    let diff = this.getIndex - otherIndex;

    if( diff < 0 )
    {
        // TODO check consistenc with other files.
        diff += this.ciseNode.getOwner().getOnCircleNodes().length;
    }
};

// This function calculates the total number of crossings the edges of this
// node cause.
CiSEOnCircleNodeExt.prototype.calculateTotalCrossing = function()
{
    let self = this;

    let count = 0;
    let temp = [];
    temp.push.apply(self.ciseNode.getOwner().getIntraClusterEdges());
    temp = temp.filter( (ele) => self.ciseNode.getEdges().indexOf(ele) < 0);

    for (let index = 0; index < self.getIntraClusterEdges().length; index++)
    {
        let edge = self.getIntraClusterEdges()[index];
        count += edge.calculateTotalCrossingWithList(temp);
    }

    return count;
};

// This function updates the conditions for swapping of this node with its
// previous and next neighbors on the associated circle.
CiSEOnCircleNodeExt.prototype.calculateTotalCrossing = function()
{
    let self = this;

    let currentCrossingNumber = self.calculateTotalCrossing();
    let currentNodeIndex = self.orderIndex;

    let nextNodeExt = self.getNextNode().getOnCircleNodeExt();
    self.orderIndex = nextNodeExt.getIndex();
    nextNodeExt.setIndex(currentNodeIndex);

    let tempCrossingNumber = self.calculateTotalCrossing();

    if (tempCrossingNumber > currentCrossingNumber)
    {
        self.canSwapWithNext = false;
    }
    else
    {
        self.canSwapWithNext = true;
    }

    nextNodeExt.setIndex(this.orderIndex);
    self.setIndex(currentNodeIndex);

    let prevNodeExt = self.getPrevNode().getOnCircleNodeExt();
    self.orderIndex = prevNodeExt.getIndex();
    prevNodeExt.setIndex(currentNodeIndex);

    tempCrossingNumber = self.calculateTotalCrossing();

    if (tempCrossingNumber > currentCrossingNumber)
    {
        self.canSwapWithPrevious = false;
    }
    else
    {
        self.canSwapWithPrevious = true;
    }

    prevNodeExt.setIndex(self.orderIndex);

    self.setIndex(currentNodeIndex);
};

// This function swaps this node with the specified neighbor (prev or next).
CiSEOnCircleNodeExt.prototype.swapWith = function(neighborExt)
{
    if ( self.getNextNode().getOnCircleNodeExt() !== neighborExt &&
         self.getPrevNode().getOnCircleNodeExt() !== neighborExt )
    {
        throw 'Attempt to swap with a non-neighbor node!';
    }

    self.ciseNode.getOwner().swapNodes(self.ciseNode, neighborExt.ciseNode);
};

// This function finds the number of crossings of inter cluster edges of this
// node with the inyer cluster edges of the other node.
CiSEOnCircleNodeExt.prototype.getInterClusterIntersections = function(other)
{
    let self = this;

    let count = 0;

    let thisInterClusterEdges = self.getInterClusterEdges();
    let otherInterClusterEdges = other.getInterClusterEdges();

    for( let i = 0; i < thisInterClusterEdges.length; i++ )
    {
        let edge = thisInterClusterEdges[i];
        // TODO check consistency
        let point1 =  self.ciseNode.getCenter();
        let point2 =  edge.getOtherEnd(self.ciseNode).getCenter();

        for ( let j = 0; j < otherInterClusterEdges.length; j++)
        {
            let otherEdge = otherInterClusterEdges[j];
            let point3 =  other.ciseNode.getCenter();
            let point4 =  otherEdge.getOtherEnd(self.ciseNode).getCenter();

            if (edge.getOtherEnd(self.ciseNode) !== otherEdge.getOtherEnd(other.ciseNode))
            {
                // TODO check consistency
                let result = IGeometry.doIntersect(point1, point2, point3, point4);

                if (result)
                {
                    count += 1;
                }
            }
        }
    }

    return count;
};

// This function returns the inter cluster edges of the associated node.
CiSEOnCircleNodeExt.prototype.getInterClusterIntersections = function()
{
    let self = this;

    if (self.interClusterEdges == null)
    {
        self.interClusterEdges = [];
        let edges = self.ciseNode.getEdges();

        for( let i = 0; i < edges.length; i++)
        {
            let edge = edges[i];
            if (!edge.isIntraCluster)
            {
                self.interClusterEdges.push(edge);
            }
        }
    }

    return self.interClusterEdges;
};

// This method returns the intra cluster edges of the associated node.
CiSEOnCircleNodeExt.prototype.getIntraClusterIntersections = function()
{
    let self = this;

    if (self.intraClusterEdges == null)
    {
        self.intraClusterEdges = [];
        let edges = self.ciseNode.getEdges();

        for( let i = 0; i < edges.length; i++)
        {
            let edge = edges[i];
            if (edge.isIntraCluster)
            {
                self.intraClusterEdges.push(edge);
            }
        }
    }

    return self.intraClusterEdges;
};


module.exports = CiSEOnCircleNodeExt;