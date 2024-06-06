/**
 * This class implements data and functionality required for AVSDF layout per
 * circle.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

let LGraph = require('layout-base').LGraph;

// -----------------------------------------------------------------------------
// Section: Initializations
// -----------------------------------------------------------------------------

function AVSDFCircle(parent, graphMgr, vObject)
{
    LGraph.call(this, parent, graphMgr, vObject);
    this.inOrder = undefined;
    this.currentIndex = 0;
    this.nodeSeparation = undefined;
    this.stack = [];
    this.perimeter = 0;
    this.centerX = 0;
    this.centerY = 0;
    this.radius = 0;
}

AVSDFCircle.prototype = Object.create(LGraph.prototype);

for(let property in LGraph)
{
    AVSDFCircle[property] = LGraph[property];
}

AVSDFCircle.prototype.initOrdering = function()
{
    this.inOrder = [];
};

// -----------------------------------------------------------------------------
// Section: Accessor Functions
// -----------------------------------------------------------------------------

// This function returns the array in which the nodes of this circle are kept in order.
AVSDFCircle.prototype.getOrder = function()
{
    return this.inOrder;
};

// This function returns the x-coordinate of the center of this circle.
AVSDFCircle.prototype.getCenterX = function()
{
    return this.centerX;
};

// This function returns the y-coordinate of the center of this circle.
AVSDFCircle.prototype.getCenterY = function()
{
    return this.centerY;
};

// This function returns the radius of this circle.
AVSDFCircle.prototype.getRadius = function()
{
    return this.radius;
};

// This function returns the total number of vertices of this circle.
AVSDFCircle.prototype.getSize = function()
{
    return this.getNodes().length;
};

// This function calculates and returns the total number of crossings in this
// circle by adding up the crossing number of individual nodes on it.
AVSDFCircle.prototype.getTotalCrossingOfCircle = function()
{
    let self = this;
    let crossingNumber = 0;
    
    for(let node in self.inOrder)
    {
        let nodeCrossing = node.getTotalCrossingOfEdges();
        if(nodeCrossing === -1)
        {
            return -1;
        }
        crossingNumber += nodeCrossing;
    }

    return crossingNumber / 4;
};

// This function checks whether or not all of the vertices of this circle are
// assigned an index on the circle.
AVSDFCircle.prototype.hasFinishedOrdering = function()
{
    return this.currentIndex === this.getNodes().length;
};

// This function returns the node separation of this circle.
AVSDFCircle.prototype.getNodeSeparation = function()
{
    return this.nodeSeparation;
};

// This function sets the node separation of this circle.
AVSDFCircle.prototype.setNodeSeparation = function(nodeSeparation)
{
    this.nodeSeparation = nodeSeparation;
};

// -----------------------------------------------------------------------------
// Section: Remaining Functions
// -----------------------------------------------------------------------------

// This function traverses the vertices of this circle and corrects the angle
// of the vertices with respect to their circle indices.
AVSDFCircle.prototype.correctAngles = function()
{
    let self = this;
    self.currentIndex = 0;

    self.inOrder.forEach(
        (node) =>  self.putInOrder(node)
    );
};


// This function puts the given node on the circle in the current order and
// sets its angle appropriately.
AVSDFCircle.prototype.putInOrder = function(node)
{
    let self = this;

    let nodes = self.getNodes();

    // Note that id attribute of a node is added before
    // AVSDFLayout is called
    let found = false;
    for(let i = 0; i < nodes.length; i++) {
        if (nodes[i].id == node.id) {
            found = true;
            break;
        }
    }

    if(!found)
    {
        throw "The node must be a member of LGraph";
    }

    self.inOrder[self.currentIndex] = node;
    node.setIndex(self.currentIndex);

    if(self.currentIndex === 0)
    {
        node.setAngle(0.0);
    }
    else
    {
        node.setAngle(self.inOrder[self.currentIndex - 1].getAngle() + 2 * Math.PI *
            (node.getDiagonal() / 2 + self.nodeSeparation +
                self.inOrder[self.currentIndex - 1].getDiagonal() / 2)
            / self.perimeter);
    }

    self.currentIndex++;
};

// This function returns the next node to be placed on this circle with
// respect to the AVSDF algorithm.
AVSDFCircle.prototype.findNodeToPlace = function()
{
    let self = this;
    let sDegreeNode = undefined;

    // Find the smallest degree vertex if the stack is empty
    if(self.stack.length === 0)
    {
        sDegreeNode = self.findUnorderedSmallestDegreeNode();
    }
    // Find the first vertex in the stack not yet placed
    else
    {
        let foundUnorderNode = false;

        while (!foundUnorderNode && !(self.stack.length === 0))
        {
            sDegreeNode = self.stack.pop();
            foundUnorderNode = !sDegreeNode.isOrdered();
        }

        if (!foundUnorderNode)
        {
            sDegreeNode = undefined;
        }
    }

    // If no unordered vertex is found in the stack, find one
    // from the remaining ones
    if(sDegreeNode === undefined)
    {
        sDegreeNode = self.findUnorderedSmallestDegreeNode();
    }

    // Add the unordered neighbors of this node to the stack
    if( sDegreeNode !== undefined)
    {
        let neighbors = sDegreeNode.getNeighborsSortedByDegree();

        for(let i = neighbors.length - 1; i >= 0 ; i--)
        {
            let neighbor = neighbors[i];

            if(!neighbor.isOrdered()) // Check here for possible error
            {
                self.stack.push(neighbor);
            }
        }
    }

    return sDegreeNode;
};

// This function calculates the radius of this circle with respect to the sizes
// of the vertices and the node separation parameter.
AVSDFCircle.prototype.calculateRadius = function()
{
    let self = this;
    let totalDiagonal = 0;

    self.getNodes().forEach(
        (node) => totalDiagonal += Math.sqrt(node.getWidth() * node.getWidth() + node.getHeight() * node.getHeight())
    );

    self.perimeter = totalDiagonal + self.getNodes().length * self.nodeSeparation;
    let radius = self.perimeter / ( 2 * Math.PI);

    // Check here for possible error

    self.getParent().setWidth( 2 * radius );
    self.getParent().setHeight( 2 * radius );
    self.getParent().setCenter( self.getParent().getWidth(), self.getParent().getHeight() );

    self.centerX = self.getParent().getCenterX();
    self.centerY = self.getParent().getCenterY();
    self.radius = self.getParent().getHeight() / 2;
};

// This function calculates the total number of crossings of all vertices of
// this circle.
AVSDFCircle.prototype.calculateEdgeCrossingsOfNodes = function()
{
    this.getNodes().forEach( (node) => node.calculateTotalCrossing());
};


// This function sets the index of each vertex to its position in inOrder
// array. Note that index of a node can be different from its place in the
// array due to crossing reduction phase of the AVSDF algorithm. It loads
// old index values to vertices due to an increase in the number of
// crossings with the new indices.
AVSDFCircle.prototype.loadOldIndicesOfNodes = function()
{
    //this.inOrder.forEach( (node,index) => node.setIndex(index));
    var self = this;
    for (let i = 0; i < this.inOrder.length; i++){
        self.inOrder[i].setIndex(i);
    }
};

// This function sets the position of each node in inOrder array to its index.
// Note that index of a node can be different from its place in the inOrder
// array due to crossing reduction phase of the AVSDF algorithm. This function
// puts the nodes to their new index values in inOrder array due to a
// decrease in the number of crossings with the new indices.
AVSDFCircle.prototype.reOrderVertices = function()
{
    var self = this;
    this.getNodes().forEach( (node) => self.inOrder[node.getIndex()] = node );
};


// This function finds and returns the unordered smallest degree vertex on
// this circle.
AVSDFCircle.prototype.findUnorderedSmallestDegreeNode = function()
{
    let minDegree = Number.MAX_SAFE_INTEGER;
    let sDegreeNode;
    
    this.getNodes().forEach(
        function(node){
            if(node.getDegree() < minDegree && !node.isOrdered())
            {
                minDegree = node.getDegree();
                sDegreeNode = node;
            }
        }
    );

    return sDegreeNode;
};


module.exports = AVSDFCircle;