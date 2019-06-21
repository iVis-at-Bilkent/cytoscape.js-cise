/**
 * This class implements data and functionality required for CiSE layout per
 * cluster.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

let LGraph = require('avsdf-base').layoutBase.LGraph;
let IGeometry = require('avsdf-base').layoutBase.IGeometry;
let NeedlemanWunsch = require('avsdf-base').layoutBase.NeedlemanWunsch;
let CircularForce = require('./CircularForce');
let CiSEConstants = require('./CiSEConstants');
let CiSEInterClusterEdgeInfo = require('./CiSEInterClusterEdgeInfo');
let CiSEInterClusterEdgeSort = require('./CiSEInterClusterEdgeSort');

function CiSECircle(parent, graphMgr, vNode) {
    LGraph.call(this, parent, graphMgr, vNode);

    // Holds the intra-cluster edges of this circle, initially it is null. It
    // will be calculated and stored when getIntraClusterEdges method is first
    // called.
    this.intraClusterEdges = null;

    // Holds the inter-cluster edges of this circle, initially it is null. It
    // will be calculated and stored when getInterClusterEdges method is first
    // called.
    this.interClusterEdges = null;

    // Holds the nodes which don't have neighbors outside this circle
    this.inNodes = [];

    // Holds the nodes which have neighbors outside this circle
    this.outNodes = [];

    // Holds the nodes which are on the circle
    this.onCircleNodes = [];

    // Holds the nodes which are inside the circle
    this.inCircleNodes = [];

    // The radius of this circle, calculated with respect to the dimensions of
    // the nodes on this circle and node separation options
    this.radius = 0;

    // Holds the pairwise ordering of on-circle nodes computed in earlier stages
    // of layout. Value at i,j means the following assuming u and v are
    // on-circle nodes with orderIndex i and j, respectively. Value at i,j is
    // true (false) if u and v are closer when we go from u to v in clockwise
    // (counter-clockwise) direction. Here we base distance on the angles of the
    // two nodes as opposed to their order indices (this might make a difference
    // due to non-uniform node sizes).
    this.orderMatrix = null;

    // Whether or not this circle may be reserved for the purpose of improving
    // inter-cluster edge crossing number as we do not want to redundantly
    // reverse clusters and end up in oscillating situtations. Clusters with
    // special circumstances (e.g. less than two inter-cluster edge) are set as
    // may not be reversed as well.
    this.mayBeReversed = true;
}

CiSECircle.prototype = Object.create(LGraph.prototype);

for ( let prop in LGraph ) {
    CiSECircle[prop] = LGraph[prop];
}

// -----------------------------------------------------------------------------
// Section: Accessors and mutators
// -----------------------------------------------------------------------------
// This method returns the radius of this circle.
CiSECircle.prototype.setRadius = function(radius) {
    this.radius = radius;
};

// This method sets the radius of this circle.
CiSECircle.prototype.getRadius = function() {
    return this.radius;
};

// This method returns nodes that don't have neighbors outside this circle.
CiSECircle.prototype.getInNodes = function() {
    return this.inNodes;
};

// This method returns nodes that have neighbors outside this circle.
CiSECircle.prototype.getOutNodes = function() {
    return this.outNodes;
};

// This method returns nodes that don't have neighbors outside this circle.
CiSECircle.prototype.getOnCircleNodes = function() {
    return this.onCircleNodes;
};

// This method returns nodes that don't have neighbors outside this circle.
CiSECircle.prototype.getInCircleNodes = function() {
    return this.inCircleNodes;
};

CiSECircle.prototype.setMayNotBeReversed = function(){
    this.mayBeReversed = false;
};


// This method returns whether or not this circle has been reversed.
CiSECircle.prototype.getMayBeReversed = function(){
    return this.mayBeReversed;
};

// This method downcasts and returns the child at given index.
CiSECircle.prototype.getChildAt = function(index){
  return this.onCircleNodes[index];
};

/**
 * This method returns the inter-cluster edges whose one end is in this
 * cluster.
 */
CiSECircle.prototype.getInterClusterEdges = function() {
    let self = this;

    if (this.interClusterEdges === null) //If this is called the first time
    {
        this.interClusterEdges = [];
        this.outNodes.forEach(function (node) {
            let edgesToAdd = node.getOnCircleNodeExt().getInterClusterEdges();
            for(let i = 0; i < edgesToAdd.length; i++){
                self.interClusterEdges.push(edgesToAdd[i]);
            }
        });
    }

    return this.interClusterEdges;
};

/**
 * This method returns the intra cluster edges of this circle
 */
CiSECircle.prototype.getIntraClusterEdges = function() {
    let self = this;

    if (this.intraClusterEdges === null) //If this is called the first time
    {
        this.intraClusterEdges = [];
        let allEdges = this.getEdges();
        allEdges.forEach(function(edge){
            if(edge.isIntraEdge())
                self.intraClusterEdges.push(edge);
        });
    }

    return this.intraClusterEdges;
};

// -----------------------------------------------------------------------------
// Section: Other methods
// -----------------------------------------------------------------------------

// This method calculates and sets dimensions of the parent node of this
// circle. Parent node is centered to be at the same location of the
// associated circle but its dimensions are larger than the circle by a
// factor (must be >= 1 to ensure all nodes are enclosed within its
// rectangle) of the largest dimension (width or height) of on-circle nodes
// so that it completely encapsulates the nodes on this circle.
CiSECircle.prototype.calculateParentNodeDimension = function() {
    let self = this;

    let maxOnCircleNodeDimension = Number.MIN_SAFE_INTEGER;

    for(let i = 0; i < this.onCircleNodes.length; i++){
        let node = this.onCircleNodes[i];

        if(node.getWidth() > maxOnCircleNodeDimension)
        {
            maxOnCircleNodeDimension = node.getWidth();
        }
        if (node.getHeight() > maxOnCircleNodeDimension)
        {
            maxOnCircleNodeDimension = node.getHeight();
        }
    }

    let dimension = 2.0 * (self.radius + self.margin) + maxOnCircleNodeDimension;
    let parentNode = self.getParent();
    parentNode.setHeight(dimension);
    parentNode.setWidth(dimension);
};

/*
 * This method computes the order matrix of this circle. This should be
 * called only once at early stages of layout and is used to hold the order
 * of on-circle nodes as specified.
 */
CiSECircle.prototype.computeOrderMatrix = function () {
    let N = this.onCircleNodes.length;

    // 'Two Dimensional array' (array of arrays in JS) with bool cell values
    this.orderMatrix = new Array(N);
    for(let i = 0; i < this.orderMatrix.length; i++){
        this.orderMatrix[i] = new Array(N);
    }

    for(let i = 0; i < N; i++){
        for(let j = 0; j < N; j++){
            if(j > i){
                let angleDiff = this.onCircleNodes[j].getOnCircleNodeExt().getAngle() -
                                this.onCircleNodes[i].getOnCircleNodeExt().getAngle();

                if (angleDiff < 0)
                {
                    angleDiff += IGeometry.TWO_PI;
                }

                if (angleDiff <= Math.PI)
                {
                    this.orderMatrix[i][j] = true;
                    this.orderMatrix[j][i] = false;
                }
                else
                {
                    this.orderMatrix[i][j] = false;
                    this.orderMatrix[j][i] = true;
                }
            }
        }
    }
};

/**
 * This method rotates this circle by iterating over and adjusting the
 * relative positioning of all nodes on this circle by the calculated angle
 * with respect to the rotation amount of the owner node.
 */
CiSECircle.prototype.rotate = function(){
    // Take size into account when reflecting total force into rotation!
    let parentNode = this.getParent();
    let noOfNodes = this.getOnCircleNodes().length;
    let rotationAmount = parentNode.rotationAmount / noOfNodes; // Think about the momentum
    let layout = this.getGraphManager().getLayout();

    if( rotationAmount !== 0.0 ){
        // The angle (θ) of rotation applied to each node
        let theta = rotationAmount / this.radius;

        if( theta > CiSEConstants.MAX_ROTATION_ANGLE )
            theta = CiSEConstants.MAX_ROTATION_ANGLE;
        else if( theta < CiSEConstants.MIN_ROTATION_ANGLE )
            theta = CiSEConstants.MIN_ROTATION_ANGLE;

        for(let i = 0; i < noOfNodes; i++){
            let onCircleNode = this.getChildAt(i);
            let onCircleNodeExt = onCircleNode.getOnCircleNodeExt();
            onCircleNodeExt.setAngle(onCircleNodeExt.getAngle() + theta); // Change the angle
            onCircleNodeExt.updatePosition(); // Apply the above angle change to its position
        }

        // Update CiSELayout displacement
        layout.totalDisplacement += parentNode.rotationAmount;

        // Reset rotationAmount
        parentNode.rotationAmount = 0.0;
    }
};

/**
 * This method returns the pairwise order of the input nodes as computed and
 * held in orderMatrix.
 */
CiSECircle.prototype.getOrder = function(nodeA, nodeB){
    return this.orderMatrix[nodeA.getOnCircleNodeExt().getIndex()][nodeB.getOnCircleNodeExt().getIndex()];
};

/**
 * This method gets the end node of the input inter-cluster edge in this
 * cluster.
 */
CiSECircle.prototype.getThisEnd = function(edge){
    let sourceNode = edge.getSource();
    let targetNode = edge.getTarget();

    if( sourceNode.getOwner() === this )
        return sourceNode;
    else
        return targetNode;
};

/**
 * This method gets the end node of the input inter-cluster edge not in this
 * cluster.
 */
CiSECircle.prototype.getOtherEnd = function(edge){
    let sourceNode = edge.getSource();
    let targetNode = edge.getTarget();

    if( sourceNode.getOwner() === this )
        return targetNode;
    else
        return sourceNode;
};

/**
 * This method calculates and returns rotational and translational parts of
 * the total force calculated for the given node. The translational part is
 * composed of components in x and y directions.
 */
CiSECircle.prototype.decomposeForce = function(node){
    let circularForce;

    if (node.displacementX !== 0.0 || node.displacementY !== 0.0)
    {
        let ownerNode = this.getParent();

        let Cx = ownerNode.getCenterX();
        let Cy = ownerNode.getCenterY();
        let Nx = node.getCenterX();
        let Ny = node.getCenterY();
        let Fx = node.displacementX;
        let Fy = node.displacementY;

        let C_angle = IGeometry.angleOfVector(Cx, Cy, Nx, Ny);
        let F_angle = IGeometry.angleOfVector(0.0, 0.0, Fx, Fy);
        let C_rev_angle = C_angle + Math.PI;

        // Check whether F lies between C and its opposite angle C-reverse;
        // if so, rotation is +ve (clockwise); otherwise, it's -ve.
        // We handle angles greater than 360 specially in the else part.
        let isRotationClockwise;
        if (Math.PI <= C_rev_angle && C_rev_angle < IGeometry.TWO_PI)
        {
            isRotationClockwise = C_angle <= F_angle && F_angle < C_rev_angle;
        }
        else
        {
            C_rev_angle -= IGeometry.TWO_PI;

            isRotationClockwise = !(C_rev_angle <= F_angle && F_angle < C_angle);
        }

        let  angle_diff = Math.abs(C_angle - F_angle);
        let F_magnitude = Math.sqrt(Fx * Fx + Fy * Fy);
        let R_magnitude = Math.abs(Math.sin(angle_diff) * F_magnitude);

        if (!isRotationClockwise)
        {
            R_magnitude = -R_magnitude;
        }

        circularForce = new CircularForce(R_magnitude, Fx, Fy);
    }
    else{
        circularForce = new CircularForce(0.0, 0.0, 0.0);
    }

    return circularForce;
};

/**
 * This method swaps the nodes given as parameter and make necessary angle
 * and positioning updates.
 */
CiSECircle.prototype.swapNodes = function(first, second){
    // Determine which node has smaller index
    let smallIndexNode = first;
    let bigIndexNode = second;
    let firstExt = first.getOnCircleNodeExt();
    let secondExt = second.getOnCircleNodeExt();

    if (smallIndexNode.getOnCircleNodeExt().getIndex() > second.getOnCircleNodeExt().getIndex())
    {
        smallIndexNode = second;
        bigIndexNode = first;
    }

    // Check the exceptional case where the small index node is at 0 index
    // and the big index node is at the last index of the circle. In this
    // case, we treat smaller index node as bigger index node and vice versa
    if (smallIndexNode.getOnCircleNodeExt().getPrevNode() === bigIndexNode)
    {
        let tempNode = bigIndexNode;
        bigIndexNode = smallIndexNode;
        smallIndexNode = tempNode;
    }

    let smallIndexNodeExt = smallIndexNode.getOnCircleNodeExt();
    let bigIndexNodeExt = bigIndexNode.getOnCircleNodeExt();

    // Calculate the angle for the big index node
    let smallIndexPrevNode = smallIndexNodeExt.getPrevNode();

    let layout = this.getGraphManager().getLayout();
    let nodeSeparation = layout.getNodeSeparation();

    let angle = (smallIndexPrevNode.getOnCircleNodeExt().getAngle() +
                (smallIndexPrevNode.getHalfTheDiagonal() +
                bigIndexNode.getHalfTheDiagonal() +
                nodeSeparation) / this.radius) % (2 * Math.PI);

    bigIndexNodeExt.setAngle(angle);

    // Calculate the angle for the small index node
    angle = (bigIndexNodeExt.getAngle() +
            (bigIndexNode.getHalfTheDiagonal() +
            smallIndexNode.getHalfTheDiagonal() +
            nodeSeparation) / this.radius) % (2 * Math.PI);

    smallIndexNodeExt.setAngle(angle);

    smallIndexNodeExt.updatePosition();
    bigIndexNodeExt.updatePosition();

    let tempIndex = firstExt.getIndex();
    firstExt.setIndex(secondExt.getIndex());
    secondExt.setIndex(tempIndex);
    this.getOnCircleNodes()[firstExt.getIndex()] =  first;
    this.getOnCircleNodes()[secondExt.getIndex()] =  second;

    firstExt.updateSwappingConditions();
    secondExt.updateSwappingConditions();

    if (firstExt.getNextNode() === second)
    {
        firstExt.getPrevNode().getOnCircleNodeExt().
        updateSwappingConditions();
        secondExt.getNextNode().getOnCircleNodeExt().
        updateSwappingConditions();
    }
    else
    {
        firstExt.getNextNode().getOnCircleNodeExt().
        updateSwappingConditions();
        secondExt.getPrevNode().getOnCircleNodeExt().
        updateSwappingConditions();
    }
};

/*
 * This method checks to see for each cluster (in no particular order)
 * whether or not reversing the order of the cluster would reduce
 * inter-cluster edge crossings. The decision is based on global sequence
 * alignment of the order of the nodes in the cluster vs. the order of their
 * neighbors in other clusters. A cluster that was reversed earlier is not
 * reversed again to avoid oscillations. It returns true if reverse order
 * is adapted.
 */
CiSECircle.prototype.checkAndReverseIfReverseIsBetter = function(){
    // First form the list of inter cluster edges of this cluster
    let interClusterEdges = this.getInterClusterEdges();
    let interClusterEdgeInfos = new Array(interClusterEdges.length);

    // Now form the info array that contains not only the inter-cluster
    // edges but also other information such as the angle they make w.r.t.
    // the cluster center and neighboring node center.
    // In the meantime, calculate how many inter-cluster edge each on-circle
    // node is incident with. This information will be used to duplicate
    // char codes of those nodes with 2 or more inter-graph edge.
    let angle;
    let clusterCenter = this.getParent().getCenter();
    let interClusterEdge;
    let endInThisCluster;
    let endInOtherCluster;
    let centerOfEndInOtherCluster;
    let nodeCount = this.onCircleNodes.length;
    let interClusterEdgeDegree = new Array(nodeCount);

    for(let i = 0; i < nodeCount; i++) {
        interClusterEdgeDegree[i] = 0;
    }

    let noOfOnCircleNodesToBeRepeated = 0;

    for(let i = 0; i < interClusterEdges.length; i++){
        interClusterEdge = interClusterEdges[i];
        endInOtherCluster = this.getOtherEnd(interClusterEdge);
        centerOfEndInOtherCluster = endInOtherCluster.getCenter();
        angle = IGeometry.angleOfVector(clusterCenter.x, clusterCenter.y,
                                        centerOfEndInOtherCluster.x, centerOfEndInOtherCluster.y);
        interClusterEdgeInfos[i] = new CiSEInterClusterEdgeInfo(interClusterEdge, angle);

        endInThisCluster = this.getThisEnd(interClusterEdge);
        interClusterEdgeDegree[endInThisCluster.getOnCircleNodeExt().getIndex()]++;

        if (interClusterEdgeDegree[endInThisCluster.getOnCircleNodeExt().getIndex()] > 1)
        {
            noOfOnCircleNodesToBeRepeated++;
        }
    }

    // On circle nodes will be ordered by their indices in this array
    let onCircleNodes = this.onCircleNodes;

    // Form arrays for current and reversed order of nodes of this cluster
    // Take any repetitions into account (if node with char code 'b' is
    // incident with 3 inter-cluster edges, then repeat 'b' 2 times)
    let nodeCountWithRepetitions = nodeCount + noOfOnCircleNodesToBeRepeated;
    let clusterNodes = new Array(2 * nodeCountWithRepetitions);
    let reversedClusterNodes = new Array(2 * nodeCountWithRepetitions);
    let node;
    let index = -1;

    for (let i = 0; i < nodeCount; i++)
    {
        node = onCircleNodes[i];

        // on circle nodes with no inter-cluster edges are also considered
        if (interClusterEdgeDegree[i] === 0)
            interClusterEdgeDegree[i] = 1;

        for (let j = 0; j < interClusterEdgeDegree[i]; j++)
        {
            index++;

            clusterNodes[index] =
                clusterNodes[nodeCountWithRepetitions + index] =
                    reversedClusterNodes[nodeCountWithRepetitions - 1 - index] =
                        reversedClusterNodes[2 * nodeCountWithRepetitions - 1 - index] =
                            node.getOnCircleNodeExt().getCharCode();
        }
    }


    // Now sort the inter-cluster edges w.r.t. their angles
    let edgeSorter = new CiSEInterClusterEdgeSort(this, interClusterEdgeInfos);

    // Form an array for order of neighboring nodes of this cluster
    let neighborNodes = new Array(interClusterEdgeInfos.length);

    for (let i = 0; i < interClusterEdgeInfos.length; i++)
    {
        interClusterEdge = interClusterEdgeInfos[i].getEdge();
        endInThisCluster = this.getThisEnd(interClusterEdge);
        neighborNodes[i] = endInThisCluster.getOnCircleNodeExt().getCharCode();
    }

    // Now calculate a score for the alignment of the current order of the
    // nodes of this cluster w.r.t. to their neighbors order

    let alignmentScoreCurrent = this.computeAlignmentScore(clusterNodes, neighborNodes);

    // Then calculate a score for the alignment of the reversed order of the
    // nodes of this cluster w.r.t. to their neighbors order

    if (alignmentScoreCurrent !== -1)
    {
        let alignmentScoreReversed = this.computeAlignmentScore(reversedClusterNodes, neighborNodes);

        // Check if reversed order is *substantially* better aligned with
        // the order of the neighbors of this cluster around the cluster; if
        // so, reverse the order

        if (alignmentScoreReversed !== -1)
        {
            if (alignmentScoreReversed > alignmentScoreCurrent)
            {
                this.reverseNodes();
                this.setMayNotBeReversed();
                return true;
            }
        }
    }

    return false;
};

/**
 * This method computes an alignment for the two input char arrays and
 * returns the alignment amount. If alignment is unsuccessful for some
 * reason, it returns -1.
 */
CiSECircle.prototype.computeAlignmentScore = function(charArrayReader1,  charArrayReader2)
{
    let aligner = new NeedlemanWunsch(charArrayReader1, charArrayReader2, 20, -1, -2);
    return aligner.getScore();
};

/**
 * This method reverses the nodes on this circle.
 */
CiSECircle.prototype.reverseNodes = function()
{
    let onCircleNodes = this.getOnCircleNodes();
    let noOfNodesOnCircle = this.getOnCircleNodes().length;

    for (let i = 0; i < noOfNodesOnCircle; i++)
    {
        let node = onCircleNodes[i];
        let nodeExt = node.getOnCircleNodeExt();

        nodeExt.setIndex((noOfNodesOnCircle - nodeExt.getIndex()) % noOfNodesOnCircle);
    }

    this.reCalculateNodeAnglesAndPositions();
};

/**
 * This method removes given on-circle node from the circle and calls
 * reCalculateCircleSizeAndRadius and  reCalculateNodeAnglesAndPositions.
 * This method should be called when an inner node is found and to be moved
 * inside the circle.
 * @param node
 */
CiSECircle.prototype.moveOnCircleNodeInside = function(node) {

    // Remove the node from on-circle nodes list and add it to in-circle
    // nodes list
    // Make sure it has not been already moved to the out node list
    let index = this.onCircleNodes.indexOf(node);
    if( index > -1){
        this.onCircleNodes.splice(index, 1);
    }

    this.inCircleNodes.push(node);

    // Re-adjust all order indexes of remaining on circle nodes.
    for (let i = 0; i < this.onCircleNodes.length; i++)
    {
        let onCircleNode = this.onCircleNodes[i];

        onCircleNode.getOnCircleNodeExt().setIndex(i);
    }

    // De-register extension
    node.setAsNonOnCircleNode();

    // calculateRadius
    this.reCalculateCircleSizeAndRadius();

    //calculateNodePositions
    this.reCalculateNodeAnglesAndPositions();

    node.setCenter(this.getParent().getCenterX(), this.getParent().getCenterY());
};

/**
 * This method calculates the size and radius of this circle with respect
 * to the sizes of the vertices and the node separation parameter.
 */
CiSECircle.prototype.reCalculateCircleSizeAndRadius = function () {
    let totalDiagonal = 0;
    let onCircleNodes = this.getOnCircleNodes();

    for (let i = 0; i < onCircleNodes.length; i++)
    {
        let node = onCircleNodes[i];

        let temp = node.getWidth() * node.getWidth() + node.getHeight() * node.getHeight();
        totalDiagonal += Math.sqrt(temp);
    }

    let layout = this.getGraphManager().getLayout();
    let nodeSeparation = layout.getNodeSeparation();

    let perimeter = totalDiagonal + this.getOnCircleNodes().length * nodeSeparation;
    this.radius = perimeter / (2 * Math.PI);
    this.calculateParentNodeDimension();
};

/**
 * This method goes over all on-circle nodes and re-calculates their angles
 * and corresponding positions. This method should be called when on-circle
 * nodes (content or order) have been changed for this circle.
 */
CiSECircle.prototype.reCalculateNodeAnglesAndPositions = function () {
    let layout = this.getGraphManager().getLayout();
    let nodeSeparation = layout.getNodeSeparation();

    // It is important that we sort these on-circle nodes in place.
    let inOrderCopy = this.onCircleNodes;
    inOrderCopy.sort(function(a, b) {
        return a.getOnCircleNodeExt().getIndex() - b.getOnCircleNodeExt().getIndex();
    });

    let parentCenterX = this.getParent().getCenterX();
    let parentCenterY = this.getParent().getCenterY();

    for (let i = 0; i < inOrderCopy.length; i++)
    {
        let node = inOrderCopy[i];
        let angle;

        if (i === 0)
        {
            angle = 0.0;
        }
        else
        {
            let previousNode =  inOrderCopy[i - 1];

            // => angle in radian = (2*PI)*(circular distance/(2*PI*r))
            angle = previousNode.getOnCircleNodeExt().getAngle() +
                    (node.getHalfTheDiagonal() + nodeSeparation + previousNode.getHalfTheDiagonal()) / this.radius;
        }

        node.getOnCircleNodeExt().setAngle(angle);
        node.setCenter(parentCenterX + this.radius * Math.cos(angle),
                       parentCenterY + this.radius * Math.sin(angle));
    }
};

module.exports = CiSECircle;