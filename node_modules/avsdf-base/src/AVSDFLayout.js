/**
 * This class implements the overall layout process for the AVSDF algorithm
 * (Circular Drawing Algorithm by He and Sykora).
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

let Layout = require('layout-base').Layout;
let AVSDFConstants = require('./AVSDFConstants.js');
let AVSDFCircle = require('./AVSDFCircle.js');
let AVSDFNode = require('./AVSDFNode.js');
let AVSDFEdge = require('./AVSDFEdge.js');

// -----------------------------------------------------------------------------
// Section: Initializations
// -----------------------------------------------------------------------------

// Constructor
function AVSDFLayout()
{
    Layout.call(this);
    this.nodeSeparation = AVSDFConstants.DEFAULT_NODE_SEPARATION;
}

AVSDFLayout.prototype = Object.create(Layout.prototype);

for (let property in Layout)
{
    AVSDFLayout[property] = Layout[property];
}

AVSDFLayout.prototype.newGraph = function (vObject)
{
    this.avsdfCircle = new AVSDFCircle(null, this.graphManager, vObject);

    return this.avsdfCircle;
};

AVSDFLayout.prototype.newNode = function (vNode)
{
    return new AVSDFNode(this.graphManager, vNode);
};

AVSDFLayout.prototype.newEdge = function (vEdge)
{
    return new AVSDFEdge(null, null, vEdge);
};

// -----------------------------------------------------------------------------
// Section: Accessor Functions
// -----------------------------------------------------------------------------

// This function returns the position data for all nodes
AVSDFLayout.prototype.getPositionsData = function()
{
    var allNodes = this.graphManager.getAllNodes();
    var pData = {};

    for (var i = 0; i < allNodes.length; i++)
    {
        var rect = allNodes[i].rect;
        var id = allNodes[i].id;

        pData[id] = {
            id: id,
            x: rect.getCenterX(),
            y: rect.getCenterY(),
            w: rect.width,
            h: rect.height
        };
    }

    return pData;
};

// -----------------------------------------------------------------------------
// Section: Layout Related
// -----------------------------------------------------------------------------

/**
 * This function performs layout on constructed l-level graph.
 * It returns true on success, false otherwise.
 * Important!: If you want to see the results of this function then, after this function is called, you have to calculate
 * and set the positions of every node. To do this call updateNodeCoordinates. However, updateNodeAngles on the other
 * hand is not needed (redundant) for this function.
 */
AVSDFLayout.prototype.layout = function ()
{
    let self = this;

    // Check if graph contains any compound structures
    if (self.graphManager.getGraphs().length > 1)
    {
        return false;
    }

    let clusterGraph = this.avsdfCircle; // Fixed reference, but now it is a bit redundant

    clusterGraph.setNodeSeparation(this.nodeSeparation);
    clusterGraph.calculateRadius();
    clusterGraph.initOrdering();

    while (!clusterGraph.hasFinishedOrdering())
    {
        let node = clusterGraph.findNodeToPlace();
        clusterGraph.putInOrder(node);
    }

    return true;
};

// This function updates the angle (in radians) property of AVSDFNode elements in the circle
AVSDFLayout.prototype.updateNodeAngles = function (){
    this.graphManager.getRoot().correctAngles(); //AVSDFCircle object
};

// This function traverses the vertices of the graph and sets their correct coordinates with respect to the owner circle.
AVSDFLayout.prototype.updateNodeCoordinates = function (){
    let clusterGraph = this.graphManager.getRoot();

    clusterGraph.getNodes().forEach(function(node) {
        node.setCenter(clusterGraph.getCenterX() + clusterGraph.getRadius() * Math.cos(node.getAngle()), clusterGraph.getCenterY() +
            clusterGraph.getRadius() * Math.sin(node.getAngle()));
    });
};

// -----------------------------------------------------------------------------
// Section: Post Processing
// -----------------------------------------------------------------------------

/**
 * This method implements the post processing step of the algorithm, which
 * tries to minimize the number of edges further with respect to the local
 * adjusting algorithm described by He and Sykora.
 */
AVSDFLayout.prototype.initPostProcess = function ()
{
    this.avsdfCircle.calculateEdgeCrossingsOfNodes();

    let list = this.avsdfCircle.getNodes();

    list.sort(function(a,b){
        return b.getTotalCrossingOfEdges() - a.getTotalCrossingOfEdges();
    });

    return list;
};

AVSDFLayout.prototype.oneStepPostProcess = function (node)
{
    let self = this;

    let currentCrossingNumber = node.getTotalCrossingOfEdges();
    let newCrossingNumber;

    let neighbours = Array.from(node.getNeighborsList());

    for (let j = 0; j < neighbours.length; j++)
    {
        let neighbour = neighbours[j];

        let oldIndex = node.getIndex();
        let newIndex = (neighbour.getIndex() + 1) % self.avsdfCircle.getSize();

        if (oldIndex !== newIndex)
        {
            node.setIndex(newIndex);

            if (oldIndex < node.getIndex())
            {
                oldIndex += self.avsdfCircle.getSize();
            }

            let index = node.getIndex();

            while (index < oldIndex)
            {
                let temp = self.avsdfCircle.getOrder()[index % self.avsdfCircle.getSize()];
                temp.setIndex((temp.getIndex() + 1) % self.avsdfCircle.getSize());
                index += 1;
            }

            node.calculateTotalCrossing();
            newCrossingNumber = node.getTotalCrossingOfEdges();

            if (newCrossingNumber >= currentCrossingNumber)
            {
                self.avsdfCircle.loadOldIndicesOfNodes();
            }
            else
            {
                self.avsdfCircle.reOrderVertices();
                currentCrossingNumber = newCrossingNumber;
            }
        }
    }
};

module.exports = AVSDFLayout;