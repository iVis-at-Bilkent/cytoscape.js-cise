let LGraph = require('layout-base').LGraph;
let HashSet = require('layout-base').HashSet;
let IGeometry = require('layout-base').IGeometry;
let Quicksort = require('layout-base').Quicksort;

let CircularForce = require('./CircularForce');
let CiSEConstants = require('./CiSEConstants');
let CiSEInterClusterEdgeInfo = require('./CiSEInterClusterEdgeInfo');


function CiSECircle(parent, graphMgr, vNode)
{
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
    this.inNodes = new HashSet();

    // Holds the nodes which have neighbors outside this circle
    this.outNodes = new HashSet();

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

for ( let prop in LGraph )
{
    CiSECircle[prop] = LGraph[prop];
}

// -----------------------------------------------------------------------------
// Section: Accessors and mutators
// -----------------------------------------------------------------------------

// This method downcasts and returns the child at given index.
CiSECircle.prototype.getChildAt = function(index)
{
    return this.getOnCircleNodes()[index]; // TODO check consistency
};

// This method is overridden to add new nodes also to on-circle nodes list
// as well
CiSECircle.prototype.add = function(newNode)
{
    this.onCircleNodes.push(newNode);
    // TODO check for correctness
    return LGraph.prototype.add.call(this, newNode);
};

// This method rotates this circle by iterating over and adjusting the
// relative positioning of all nodes on this circle by the calculated angle
// with respect to the rotation amount of the owner node.
CiSECircle.prototype.rotate = function()
{ //TODO check consistency
    let self = this;

    let parentNode = self.getParent();
    let noOfNodes = self.getOnCircleNodes().length;
    let rotationAmount = parentNode.rotationAmount / noOfNodes;
    let onCircleNode = null;
    let onCircleNodeExt = null;
    let layout = self.getGraphManager().getLayout();

    if(rotationAmount !== 0.0) {
        let theta = rotationAmount / self.radius;

        if (theta > CiSEConstants.MAX_ROTATION_ANGLE) {
            theta = CiSEConstants.MAX_ROTATION_ANGLE;
        }
        else if (theta < CiSEConstants.MIN_ROTATION_ANGLE) {
            theta = CiSEConstants.MIN_ROTATION_ANGLE;
        }


        for (let i = 0; i < noOfNodes; i++) {
            onCircleNode = self.getChildAt(i);
            onCircleNodeExt = onCircleNode.getOnCircleNodeExt();
            onCircleNodeExt.setAngle(onCircleNodeExt.getAngle() + theta);
            onCircleNodeExt.updatePosition();
        }

        layout.totalDisplacement += parentNode.rotationAmount;

        parentNode.rotationAmount = 0.0;
    }
};

// This method returns the radius of this circle.
CiSECircle.prototype.getRadius = function(radius)
{
    this.radius = radius;
};

// This method sets the radius of this circle.
CiSECircle.prototype.setRadius = function()
{
    return this.radius;
};

// This method returns nodes that don't have neighbors outside this circle.
CiSECircle.prototype.getInNodes = function()
{
    return this.inNodes;
};

// This method returns nodes that have neighbors outside this circle.
CiSECircle.prototype.getOutNodes = function()
{
    return this.outNodes;
};

// This method returns nodes that don't have neighbors outside this circle.
CiSECircle.prototype.getOnCircleNodes = function()
{
    return this.onCircleNodes;
};

// This method returns nodes that don't have neighbors outside this circle.
CiSECircle.prototype.getInCircleNodes = function()
{
    return this.inCircleNodes;
};

// This method returns the pairwise order of the input nodes as computed and
// held in orderMatrix.
CiSECircle.prototype.getOrder = function(nodeA, nodeB)
{
    let self = this;

    // TODO get rid of hardcoded assertions after debugging
    if(self.orderMatrix === null)
    {
        throw 'Order Matrix should not be null';
    }

    if(nodeA === null)
    {
        throw 'Node A should not be null.';
    }

    if(nodeB === null)
    {
        throw 'Node B should not be null.';
    }

    if(nodeA.getOnCircleNodeExt() === null)
    {
        throw 'Node A must have on circle node extension.';
    }

    if(nodeB.getOnCircleNodeExt() === null)
    {
        throw 'Node B must have on circle node extension.';
    }

    return this.orderMatrix[nodeA.getOnCircleNodeExt().getIndex()][nodeB.getOnCircleNodeExt().getIndex()];
};

//  This method computes the order matrix of this circle. This should be
// 	called only once at early stages of layout and is used to hold the order
// 	of on-circle nodes as specified.
CiSECircle.prototype.computeOrderMatrix = function()
{
    let self = this;
    if(self.orderMatrix !== null)
    {
        throw 'Order Matrix should have been empty';
    }

    let N = this.onCircleNodes.lenght;
    self.orderMatrix = [];
    for(let i = 0; i < N; i++)
    {
        self.orderMatrix[i] = [];
        for(let j = 0; j < N; j++)
        {
            self.orderMatrix[i][j] = false;
            // TODO maybe change the initial value.
        }
    }

    let nodeA = null;
    let nodeB = null;
    let angleDiff = 0.0;

    for (let i = 0; i < N; i++)
    {
        nodeA = self.onCircleNodes[i];
        for(let j = 0; j < N; j++)
        {
            nodeB = self.onCircleNodes[j];
            if(j > i)
            {
                angleDiff = nodeB.getOnCircleNodeExt().getAngle() -
                    nodeA.getOnCircleNodeExt().getAngle();

                if (angleDiff < 0)
                {
                    angleDiff += IGeometry.TWO_PI;
                }

                if (angleDiff <= Math.PI)
                {
                    self.orderMatrix[i][j] = true;
                    self.orderMatrix[j][i] = false;
                }
                else
                {
                    self.orderMatrix[i][j] = false;
                    self.orderMatrix[j][i] = true;
                }
            }

        }
    }
};

//  This method returns whether or not this circle has been reversed.
CiSECircle.prototype.mayBeReversed = function()
{
    return this.mayBeReversed;
};

// This method sets this circle as must not be reversed.
CiSECircle.prototype.setMayNotBeReversed = function()
{
    if(this.mayBeReversed === false)
    {
        throw 'mayBeReversed flag must have been set for this circle';
    }
    this.mayBeReversed = false;
};

// This method gets the end node of the input inter-cluster edge in this
// cluster.
CiSECircle.prototype.getThisEnd = function(edge)
{
    let self = this;

    if(edge.isIntraCluster)
    {
        throw 'The edge must have been an inter cluster edge';
    }

    let sourceNode = edge.getSource();
    let targetNode = edge.getTarget();

    if (sourceNode.getOwner() === self)
    {
        return sourceNode;
    }

    else
    {
        if(targetNode.getOwner() !== this)
        {
            throw 'At least source or the target node of this edge must have been a member of this circle';
        }

        return targetNode;
    }
};
//  This method gets the end node of the input inter-cluster edge not in this
// 	cluster.
CiSECircle.prototype.getOtherEnd = function(edge)
{
    let self = this;

    if(edge.isIntraCluster)
    {
        throw 'The edge must have been an inter cluster edge';
    }

    let sourceNode = edge.getSource();
    let targetNode = edge.getTarget();

    if (sourceNode.getOwner() === self)
    {
        return sourceNode;
    }
    else
    {
        if(targetNode.getOwner() !== this)
        {
            throw 'At least source or the target node of this edge must have been a member of this circle';
        }

        return sourceNode;
    }
};

// This method calculates and sets dimensions of the parent node of this
// circle. Parent node is centered to be at the same location of the
// associated circle but its dimensions are larger than the circle by a
// factor (must be >= 1 to ensure all nodes are enclosed within its
// rectangle) of the largest dimension (width or height) of on-circle nodes
// so that it completely encapsulates the nodes on this circle.
CiSECircle.prototype.calculateParentNodeDimension = function()
{
    let self = this;

    if(self.getOnCircleNodes().size() === 0)
    {
        throw 'At least one node must be a member of the circle';
    }

    let maxOnCircleNodeDimension = Number.MIN_SAFE_INTEGER;

    self.getOnCircleNodes().forEach(
        function(node)
        {
            if(node.getWidth() > maxOnCircleNodeDimension)
            {
                maxOnCircleNodeDimension = node.getWidth();
            }
            if (node.getHeight() > maxOnCircleNodeDimension)
            {
                maxOnCircleNodeDimension = node.getHeight();
            }
        }
    );

    let dimension = 2.0 * (self.radius + self.getMargin()) + maxOnCircleNodeDimension;
    let parentNode = self.getParent();
    parentNode.setHeight(dimension);
    parentNode.setWidth(dimension);
};

// -----------------------------------------------------------------------------
// Section: Other methods
// -----------------------------------------------------------------------------

// This method calculates and returns rotational and translational parts of
// the total force calculated for the given node. The translational part is
// composed of components in x and y directions.
CiSECircle.prototype.decomposeForce = function(node)
{
    let self = this;

    if(node.getOwner() !== self)
    {
        throw 'The node must belong to this circle';
    }

    let circularForce = null;

    if (node.displacementX !== 0.0 || node.displacementY !== 0.0) {
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

        if (!(Math.PI <= C_rev_angle && C_rev_angle <= IGeometry.THREE_PI)) {
            throw 'revolution angle is not between pi and 3*pi';
        }

        // Check whether F lies between C and its opposite angle C-reverse;
        // if so, rotation is +ve (clockwise); otherwise, it's -ve.
        // We handle angles greater than 360 specially in the else part.
        let isRotationClockwise;

        if (Math.PI <= C_rev_angle && C_rev_angle < IGeometry.TWO_PI) {
            if (C_angle <= F_angle && F_angle < C_rev_angle) {
                isRotationClockwise = true;
            }
            else {
                isRotationClockwise = false;
            }
        }
        else
        {
            C_rev_angle -= IGeometry.TWO_PI;

            if( !( 0.0 <= C_rev_angle && C_rev_angle <= Math.PI) )
            {
                throw 'revolution angle is not between 0 and pi';
            }

            if (C_rev_angle <= F_angle && F_angle < C_angle)
            {
                isRotationClockwise = false;
            }
            else
            {
                isRotationClockwise = true;
            }
        }

        let angle_diff = Math.abs(C_angle - F_angle);
        let F_magnitude = Math.sqrt(Fx * Fx + Fy * Fy);
        let R_magnitude = Math.abs(Math.sin(angle_diff) * F_magnitude);

        if (!isRotationClockwise)
        {
            R_magnitude = -R_magnitude;
        }

        circularForce = new CircularForce(R_magnitude, Fx, Fy);
    }
    else
    {
        circularForce = new CircularForce(0.0, 0.0, 0.0);
    }

    return circularForce;
};

// This method swaps the nodes given as parameter and make necessary angle
// and positioning updates.
CiSECircle.prototype.swapNodes = function(first, second)
{
    let self = this;
    if(first.getOwner() !== this || second.getOwner() !== this)
    {
      throw 'In order to swap nodes on a circle, the nodes must be a member of the circle';
    }

    // Determine which node has smaller index.
    let smallIndexNode = first;
    let bigIndexNode = second;
    let firstExt = first.getOnCircleNodeExt();
    let secondExt = second.getOnCircleNodeExt();

    if (smallIndexNode.getOnCircleNodeExt().getIndex() >
        second.getOnCircleNodeExt().getIndex())
    {
        smallIndexNode = second;
        bigIndexNode = first;
    }

    // Check the exceptional case where the small index node is at 0 index
    // and the big index node is at the last index of the circle. In this
    // case, we treat smaller index node as bigger index node and vice versa
    if (smallIndexNode.getOnCircleNodeExt().getPrevNode() == bigIndexNode)
    {
        let tempNode = bigIndexNode;
        bigIndexNode = smallIndexNode;
        smallIndexNode = tempNode;
    }

    let smallIndexNodeExt = smallIndexNode.getOnCircleNodeExt();
    let bigIndexNodeExt = bigIndexNode.getOnCircleNodeExt();

    // Calculate the angle for the big index node
    let smallIndexPrevNode = smallIndexNodeExt.getPrevNode();

    let layout = self.getGraphManager().getLayout();
    let nodeSeparation = layout.getNodeSeparation();

    let angle = (smallIndexPrevNode.getOnCircleNodeExt().getAngle() +
        (smallIndexPrevNode.getHalfTheDiagonal() +
            bigIndexNode.getHalfTheDiagonal() +
            nodeSeparation) / self.radius) % (2 * Math.PI);
    bigIndexNodeExt.setAngle(angle);

    // Calculate the angle for the small index node
    angle = (bigIndexNodeExt.getAngle() +
        (bigIndexNode.getHalfTheDiagonal() +
            smallIndexNode.getHalfTheDiagonal() +
            nodeSeparation) / self.radius) % (2 * Math.PI);
    smallIndexNodeExt.setAngle(angle);

    smallIndexNodeExt.updatePosition();
    bigIndexNodeExt.updatePosition();

    let tempIndex = firstExt.getIndex();
    firstExt.setIndex(secondExt.getIndex());
    secondExt.setIndex(tempIndex);

    self.getOnCircleNodes()[firstExt.getIndex()] =  first;
    self.getOnCircleNodes()[secondExt.getIndex()] =  second;

    firstExt.updateSwappingConditions();
    secondExt.updateSwappingConditions();

    if (firstExt.getNextNode() == second)
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

// This method returns the intra cluster edges of this circle
CiSECircle.prototype.getIntraClusterEdges = function()
{
    let self = this;

    if (self.intraClusterEdges === null)
    {
        self.intraClusterEdges = [];
        let index = 0;
        self.getEdges().forEach(
            function(edge)
            {
                if (edge.isIntraCluster)
                {
                    self.intraClusterEdges[index] = edge;
                }
                index++;
            }
        );
    }

    return self.intraClusterEdges;
};

// This method returns the inter-cluster edges whose one end is in this
// cluster.
CiSECircle.prototype.getInterClusterEdges = function()
{
    let self = this;

    if (self.interClusterEdges === null)
    {
        self.interClusterEdges = [];
        let index = 0;
        self.getEdges().forEach(
            function(edge)
            {
                if (edge.isInterCluster)
                {
                    self.interClusterEdges[index] = edge;
                }
                index++;
            }
        );
    }

    return self.interClusterEdges;
};

// This method checks to see for each cluster (in no particular order)
// whether or not reversing the order of the cluster would reduce
// inter-cluster edge crossings. The decision is based on global sequence
// alignment of the order of the nodes in the cluster vs. the order of their
// neighbors in other clusters. A cluster that was reversed earlier is not
// reversed again to avoid oscillations. It returns true if reverse order
// is adapted.
CiSECircle.prototype.checkAndReverseIfReverseIsBetter = function()
{
    let self = this;

    if(!self.mayBeReversed)
    {
        throw 'The circle must be a candidate for revarsal';
    }

    // First form the list of inter cluster edges of this cluster

    let interClusterEdges = self.getInterClusterEdges();
    let interClusterEdgeInfos = []; // of size interClusterEdges.length

    // Now form the info array that contains not only the inter-cluster
    // edges but also other information such as the angle they make w.r.t.
    // the cluster center and neighboring node center.
    // In the meantime, calculate how many inter-cluster edge each on-circle
    // node is incident with. This information will be used to duplicate
    // char codes of those nodes with 2 or more inter-graph edge.
    let angle;
    let interClusterEdge;
    let endInThisCluster;
    let endInOtherCluster;
    let centerOfEndInOtherCluster;
    let clusterCenter = self.getParent().getCenter();
    let nodeCount = self.onCircleNodes.size();
    let interClusterEdgeDegree = []; // of size nodeCount
    let noOfOnCircleNodesToBeRepeated = 0;

    for(let i = 0; i < interClusterEdges.length; i++)
    {
        interClusterEdge = interClusterEdges[i];
        endInOtherCluster = self.getOtherEnd(interClusterEdge);
        centerOfEndInOtherCluster = endInOtherCluster.getCenter();
        angle = IGeometry.angleOfVector(clusterCenter.x, clusterCenter.y,
            centerOfEndInOtherCluster.x, centerOfEndInOtherCluster.y);
        interClusterEdgeInfos[i] =
            new CiSEInterClusterEdgeInfo(interClusterEdge, angle);

        endInThisCluster = self.getThisEnd(interClusterEdge);
        interClusterEdgeDegree[endInThisCluster.getOnCircleNodeExt().getIndex()]++;

        if (interClusterEdgeDegree[endInThisCluster.getOnCircleNodeExt().getIndex()] > 1)
        {
            noOfOnCircleNodesToBeRepeated++;
        }
    }

    // TODO check if on circle nodes are ordered by their indices

    // Form arrays for current and reversed order of nodes of this cluster
    // Take any repetitions into account (if node with char code 'b' is
    // incident with 3 inter-cluster edges, then repeat 'b' 2 times)
    let nodeCountWithRepetitions = nodeCount + noOfOnCircleNodesToBeRepeated;
    let clusterNodes = []; // of size 2 * nodeCountWithRepetitions]
    let reversedClusterNodes = []; // of size 2 * nodeCountWithRepetitions]
    let node;
    let index = -1;

    for (let i = 0; i < nodeCount; i++)
    {
        node = self.onCircleNodes[i];

        // on circle nodes with no inter-cluster edges are also considered
        if (interClusterEdgeDegree[i] == 0)
        {
            interClusterEdgeDegree[i] = 1;
        }

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
    // Lines 693 - 695

    // Form an array for order of neighboring nodes of this cluster
    let neighborNodes = []; // of size interClusterEdgeInfos.length

    for (let i = 0; i < interClusterEdgeInfos.length; i++)
    {
        interClusterEdge = interClusterEdgeInfos[i].getEdge();
        endInThisCluster = self.getThisEnd(interClusterEdge);
        neighborNodes[i] = endInThisCluster.getOnCircleNodeExt().getCharCode();
    }

    // Now calculate a score for the alignment of the current order of the
    // nodes of this cluster w.r.t. to their neighbors order
    let alignmentScoreCurrent = 0;
    // Lines 711 - 713

    // Then calculate a score for the alignment of the reversed order of the
    // nodes of this cluster w.r.t. to their neighbors order
    if (alignmentScoreCurrent != -1)
    {} // Lines 718 - 739

    return false;
};

// This method computes an alignment for the two input char arrays and
// returns the alignment amount. If alignment is unsuccessful for some
// reason, it returns -1.
CiSECircle.prototype.computeAlignmentScore = function()
{
    // TODO
};

// This method reverses the nodes on this circle.
CiSECircle.prototype.reverseNodes = function()
{
    let self = this;

    let noOfNodesOnCircle = self.getOnCircleNodes().size();

    self.getOnCircleNodes.forEach(function(node){
        let nodeExt = node.getOnCircleNodeExt();
        nodeExt.setIndex((noOfNodesOnCircle - nodeExt.getIndex()) % noOfNodesOnCircle);
    });

    self.reCalculateNodeAnglesAndPositions();
};

// This method removes given on-circle node from the circle and calls
// reCalculateCircleSizeAndRadius and  reCalculateNodeAnglesAndPositions.
// This method should be called when an inner node is found and to be moved
// inside the circle.
CiSECircle.prototype.moveOnCircleNodeInside = function(node)
{
    let self = this;

    if(node.getOnCircleNodeExt() == null)
    {
        throw "the node must be on circle to move inside!";
    }

    // Remove the node from on-circle nodes list and add it to in-circle
    // nodes list
    let nodePos = self.onCircleNodes.indexOf(node);
    self.onCircleNodes.splice(nodePos,1);
    self.inCircleNodes.push(node);

    // Re-adjust all order indexes of remaining on circle nodes.
    for (let i=0; i < self.onCircleNodes.length; i++)
    {
        let onCircleNode = self.onCircleNodes.get(i);
        onCircleNode.getOnCircleNodeExt().setIndex(i);
    }

    // De-register extension
    node.setAsNonOnCircleNode();

    // calculateRadius
    self.reCalculateCircleSizeAndRadius();

    //calculateNodePositions
    self.reCalculateNodeAnglesAndPositions();

    node.setCenter(self.getParent().getCenterX(),
        self.getParent().getCenterY());
};

// This method calculates the size and radius of this circle with respect
// to the sizes of the vertices and the node separation parameter.
CiSECircle.prototype.reCalculateCircleSizeAndRadius = function()
{
    let self = this;

    let totalDiagonal = 0;
    let temp;

    self.getOnCircleNodes().forEach(function(node){
        temp = node.getWidth() * node.getWidth() +
            node.getHeight() * node.getHeight();
        totalDiagonal += Math.sqrt(temp);
    });

    let layout = this.getGraphManager().getLayout();
    let nodeSeparation = layout.getNodeSeparation();
    let perimeter = totalDiagonal +
        self.getOnCircleNodes().length * nodeSeparation;
    self.radius = perimeter / (2 * Math.PI);
    self.calculateParentNodeDimension();
};

// This method goes over all on-circle nodes and re-calculates their angles
// and corresponding positions. This method should be called when on-circle
// nodes (content or order) have been changed for this circle.
CiSECircle.prototype.reCalculateNodeAnglesAndPositions = function()
{
    let self = this;

    let layout = this.getGraphManager().getLayout();
    let nodeSeparation = layout.getNodeSeparation();

    // It is important that we sort these on-circle nodes in place.
    let inOrderCopy = self.onCircleNodes;

    let comparisonFn = function(a,b)
    {
        return b.getOnCircleNodeExt().getIndex() >
                a.getOnCircleNodeExt().getIndex();
    };

    Quicksort.quicksort(inOrderCopy, comparisonFn);

    let parentCenterX = self.getParent().getCenterX();
    let parentCenterY = self.getParent().getCenterY();

    for (let i = 0; i < inOrderCopy.length; i++)
    {
        let node = inOrderCopy[i];
        let angle;

        if(i === 0)
        {
            angle = 0.0;
        }
        else
        {
            let previousNode = inOrderCopy[i - 1];

            // => angle in radian = (2*PI)*(circular distance/(2*PI*r))
            angle = previousNode.getOnCircleNodeExt().getAngle() +
                (node.getDiagonal() / 2 + nodeSeparation +
                    previousNode.getDiagonal() / 2) /
                self.radius;
        }

        node.getOnCircleNodeExt().setAngle(angle);
        node.setCenter(parentCenterX + self.radius * Math.cos(angle),
            parentCenterY +	self.radius * Math.sin(angle));
    }
};

module.exports = CiSECircle;