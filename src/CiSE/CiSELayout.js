/**
 * This class implements a Circular Spring Embedder (CiSE) layout algortithm.
 * The algorithm is used for layout of clustered nodes where nodes in each
 * cluster is drawn around a circle. The basic steps of the algorithm follows:
 * - Step 1: each cluster is laid out with AVSDF circular layout algorithm;
 * - Step 2: cluster graph (quotient graph of the clustered graph, where nodes
 *   correspond to clusters and edges correspond to inter-cluster edges) is laid
 *   out with a spring embedder to determine the initial layout;
 * - Steps 3-5: the cluster graph is laid out with a modified spring embedder,
 *   where the nodes corresponding to clusters are also allowed to rotate,
 *   indirectly affecting the layout of the nodes inside the clusters. In Step
 *   3, we allow flipping of clusters, whereas in Step 4, we allow swapping of
 *   neighboring node pairs in a cluster to improve inter-cluster edge crossings
 *   without increasing intra-cluster crossings.
 *
 *   The input view aspect of GraphManager is inherited from Java version of
 *   CiSE (Chilay) as a side effect. Ignore any references to 'view' elements.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

// -----------------------------------------------------------------------------
// Section: Initializations
// -----------------------------------------------------------------------------

let Layout = require('avsdf-base').layoutBase.FDLayout;
let HashMap = require('avsdf-base').layoutBase.HashMap;
const PointD = require('avsdf-base').layoutBase.PointD;
const DimensionD = require('avsdf-base').layoutBase.DimensionD;
let AVSDFConstants = require('avsdf-base').AVSDFConstants;
const AVSDFLayout = require('avsdf-base').AVSDFLayout;
const CoSELayout = require('cose-base').CoSELayout;
const CoSEConstants = require('cose-base').CoSEConstants;
const CiSEConstants = require('./CiSEConstants');
const CiSEGraphManager = require('./CiSEGraphManager');
const CiSECircle = require('./CiSECircle');
const CiSENode = require('./CiSENode');
const CiSEEdge = require('./CiSEEdge');
const CiSEOnCircleNodePair = require('./CiSEOnCircleNodePair');

// Constructor
function CiSELayout()
{
    Layout.call(this);

    /**
     * Whether it is incremental
     */
    this.incremental = CiSEConstants.INCREMENTAL;

    /**
     * Separation of the nodes on each circle customizable by the user
     */
    this.nodeSeparation = CiSEConstants.DEFAULT_NODE_SEPARATION;

    /**
     * Ideal edge length coefficient for inter-cluster edges
     */
    this.idealInterClusterEdgeLengthCoefficient = CiSEConstants.DEFAULT_IDEAL_INTER_CLUSTER_EDGE_LENGTH_COEFF;

    /**
     * Decides whether pull on-circle nodes inside of the circle.
     */
    this.allowNodesInsideCircle = CiSEConstants.DEFAULT_ALLOW_NODES_INSIDE_CIRCLE;

    /**
     * Max percentage of the nodes in a circle that can move inside the circle
     */
    this.maxRatioOfNodesInsideCircle = CiSEConstants.DEFAULT_MAX_RATIO_OF_NODES_INSIDE_CIRCLE;

    /**
     * Current step of the layout process
     */
    this.step = CiSELayout.STEP_NOT_STARTED;

    /**
     * Current phase of current step
     */
    this.phase = CiSELayout.PHASE_NOT_STARTED;

    /**
     * Holds the set of pairs swapped in the last swap phase.
     */
    this.swappedPairsInLastIteration = [];

    /**
     * Iterations in the runSpringEmbedderTicl function
     */
    this.iterations = 0;

    this.oldTotalDisplacement = 0.0;

    /**
     * Cooling Factor Variables
     */
    this.coolingCycle = 0;
    this.maxCoolingCycle = this.maxIterations / CiSEConstants.CONVERGENCE_CHECK_PERIOD;
}

CiSELayout.prototype = Object.create(Layout.prototype);

for (let property in Layout)
{
    CiSELayout[property] = Layout[property];
}

// -----------------------------------------------------------------------------
// Section: Class constants
// -----------------------------------------------------------------------------
/**
 * Steps of layout
 */
CiSELayout.STEP_NOT_STARTED = 0;
CiSELayout.STEP_1 = 1;
CiSELayout.STEP_2 = 2;
CiSELayout.STEP_3 = 3;
CiSELayout.STEP_4 = 4;
CiSELayout.STEP_5 = 5;

/**
 * Phases of a step
 */
CiSELayout.PHASE_NOT_STARTED = 0;
CiSELayout.PHASE_SWAP_PREPERATION = 1;
CiSELayout.PHASE_PERFORM_SWAP = 2;
CiSELayout.PHASE_OTHER = 3;

// -----------------------------------------------------------------------------
// Section: Class methods
// -----------------------------------------------------------------------------

/**
 * This method creates a new graph manager associated with this layout.
 */
CiSELayout.prototype.newGraphManager = function(){
    this.graphManager = new CiSEGraphManager(this);
    return this.graphManager;
};

/**
 * This method creates a new graph(CiSECircle) associated with the input view graph.
 */
CiSELayout.prototype.newCircleLGraph = function(vGraph){
    return new CiSECircle(null, this.graphManager, vGraph);
};

/**
 * This method creates a new node associated with the input view node.
 */
CiSELayout.prototype.newNode = function(loc, size)
{
    return new CiSENode(this.graphManager, loc, size, null);
};

/**
 * This method creates a new on-circle CiSE node associated with the input
 * view node.
 */
CiSELayout.prototype.newCiSEOnCircleNode = function(loc, size)
{
    let newNode = this.newNode(loc, size);
    newNode.setAsOnCircleNode();

    return newNode;
};

/**
 * This method creates a new edge associated with the input view edge.
 */
CiSELayout.prototype.newEdge = function(source,target, vEdge)
{
    return new CiSEEdge(source, target, vEdge);
};

/**
 * This method returns the node separation amount for this layout.
 */
CiSELayout.prototype.getNodeSeparation = function()
{
    return this.nodeSeparation;
};


/**
 * This method establishes the GraphManager object related to this layout. Each compound(LGraph) is CiSECircle except
 * for the root.
 * @param nodes: All nodes in the graph
 * @param edges: All edges in the graph
 * @param clusters: Array of cluster ID arrays. Each array represents a cluster where ID ∈ {0,1,2,..,n(# of clusters)}
 *
 * Notes:
 * -> For unclustered nodes, their clusterID is -1.
 * -> CiSENode that corresponds to a cluster has no ID property.
 */
CiSELayout.prototype.convertToClusteredGraph = function(nodes, edges, clusters){

    let self = this;
    let idToLNode = {};
    let rootGraph = this.graphManager.getRoot();

    // Firstly, lets create a HashMap to get node properties easier
    let idToCytoscapeNode = new HashMap();
    for(let i = 0; i < nodes.length; i++){
        idToCytoscapeNode.put(nodes[i].data('id'), nodes[i]);
    }

    // If it is a function just change it
    if (typeof clusters === "function") {
        let cIDs = [];
        let temp = [];

        for(let i = 0; i < nodes.length; i++){
            let cID = clusters(nodes[i]);
            if (cID > 0 && cID !== null && cID !== undefined ) {
                let index = cIDs.indexOf( cID );
                if (index > -1) {
                    temp[index].push(nodes[i].data('id'));
                }
                else{
                    cIDs.push(cID);
                    temp.push([nodes[i].data('id')]);
                }
            }
        }
        clusters = temp;
    }

    // lets add the nodes in clusters to the GraphManager
    for(let i = 0; i < clusters.length; i++)
    {
        if(clusters[i].length === 0)
            continue;

        // Create a CiSENode for the cluster
        let clusterNode = this.newNode(null);

        // ClusterID ∈ {0,1,2,..,n(# of clusters)}
        clusterNode.setClusterId(i);

        // Add it rootGraph
        rootGraph.add(clusterNode);

        // Create the associated Circle representing the cluster and link them together
        let circle = this.newCircleLGraph(null);
        this.graphManager.add(circle, clusterNode);

        // Set bigger margins so clusters are spaced out nicely
        circle.margin = circle.margin + 15;

        // Move each node of the cluster into this circle
        clusters[i].forEach(function(nodeID){
            let cytoNode = idToCytoscapeNode.get(nodeID);
            let dimensions = cytoNode.layoutDimensions({
                nodeDimensionsIncludeLabels: false
            });
            // Adding a node into the circle
            let ciseNode = self.newCiSEOnCircleNode(new PointD(cytoNode.position('x') - dimensions.w / 2,
                cytoNode.position('y') - dimensions.h / 2),
                new DimensionD(parseFloat(dimensions.w), parseFloat(dimensions.h)));
            ciseNode.setId(nodeID);
            ciseNode.setClusterId(i);
            circle.getOnCircleNodes().push(ciseNode);
            circle.add(ciseNode);

            // Initially all on-circle nodes are assumed to be in-nodes
            circle.getInNodes().push(ciseNode);

            // Map the node
            idToLNode[ciseNode.getId()] = ciseNode;
        });
    }

    // Now, add unclustered nodes to the GraphManager
    for(let i = 0; i < nodes.length; i++) {
        let clustered = false;

        clusters.forEach(cluster => {
            if( cluster.includes( nodes[i].data('id') ))
                clustered = true;
        });

        if(!clustered){
            let cytoNode = nodes[i];
            let dimensions = cytoNode.layoutDimensions({
                nodeDimensionsIncludeLabels: false
            });
            let CiSENode = this.newNode(new PointD(cytoNode.position('x') - dimensions.w / 2,
                cytoNode.position('y') - dimensions.h / 2),
                new DimensionD(parseFloat(dimensions.w), parseFloat(dimensions.h)));
            CiSENode.setClusterId(-1);
            CiSENode.setId( nodes[i].data('id') );
            rootGraph.add(CiSENode);

            // Map the node
            idToLNode[CiSENode.getId()] = CiSENode;
        }
    }

    // Lastly, add all edges
    for(let i = 0; i < edges.length; i++) {
        let e = edges[i];
        let sourceNode = idToLNode[e.data("source")];
        let targetNode = idToLNode[e.data("target")];
        let sourceClusterID = sourceNode.getClusterId();
        let targetClusterID = targetNode.getClusterId();

        if(sourceNode === targetNode)
            continue;

        let ciseEdge = self.newEdge(sourceNode, targetNode, null);

        // Edge is intracluster
        // Remember: If source or target is unclustered then edge is Not intracluster
        if(sourceClusterID === targetClusterID && sourceClusterID !== -1 && targetClusterID !== -1){
            ciseEdge.isIntraCluster = true;
            ciseEdge.getSource().getOwner().add(ciseEdge, ciseEdge.getSource(), ciseEdge.getTarget());
        }
        else{
            ciseEdge.isIntraCluster = false;
            this.graphManager.add(ciseEdge, ciseEdge.getSource(), ciseEdge.getTarget());
        }
    }

    // Populate the references of GraphManager
    let onCircleNodes = [];
    let nonOnCircleNodes = [];
    let allNodes = this.graphManager.getAllNodes();
    for(let i = 0; i < allNodes.length; i++){
        if(allNodes[i].getOnCircleNodeExt()){
            onCircleNodes.push(allNodes[i]);
        }
        else{
            nonOnCircleNodes.push(allNodes[i]);
        }
    }

    this.graphManager.setOnCircleNodes(onCircleNodes);
    this.graphManager.setNonOnCircleNodes(nonOnCircleNodes);

    // Deternine out-nodes of each circle
    this.graphManager.edges.forEach(function(e){
        let sourceNode = e.getSource();
        let targetNode = e.getTarget();
        let sourceClusterID = sourceNode.getClusterId();
        let targetClusterID = targetNode.getClusterId();

        // If an on-circle node is an out-node, then remove it from the
        // in-node list and add it to out-node list of the associated
        // circle. Notice that one or two ends of an inter-graph edge will
        // be out-node(s).
        if(sourceClusterID !== -1){
            let circle = sourceNode.getOwner();

            // Make sure it has not been already moved to the out node list
            let index = circle.getInNodes().indexOf(sourceNode);
            if( index > -1){
                circle.getInNodes().splice(index, 1);
                circle.getOutNodes().push(sourceNode);
            }
        }

        if(targetClusterID !== -1){
            let circle = targetNode.getOwner();

            // Make sure it has not been already moved to the out node list
            let index = circle.getInNodes().indexOf(targetNode);
            if( index > -1){
                circle.getInNodes().splice(index, 1);
                circle.getOutNodes().push(targetNode);
            }
        }
    });

    return idToLNode;
};

/**
 * This method runs AVSDF layout for each cluster.
 */
CiSELayout.prototype.doStep1 = function(){
    this.step = CiSELayout.STEP_1;
    this.phase = CiSELayout.PHASE_OTHER;

    // Mapping for transferring positions and dimensions back
    let ciseToAvsdf = new HashMap();

    let allGraphs = this.graphManager.getGraphs();
    for(let i = 0; i < allGraphs.length; i++){
        let graph = allGraphs[i];

        // Skip the root graph which is a normal LGraph
        if(graph instanceof CiSECircle) {
            // Create the AVSDF layout objects
            AVSDFConstants.DEFAULT_NODE_SEPARATION = this.nodeSeparation;
            let avsdfLayout = new AVSDFLayout();
            let avsdfCircle = avsdfLayout.graphManager.addRoot();
            let clusteredNodes = graph.getOnCircleNodes();

            // Create corresponding AVSDF nodes in current cluster
            for (let i = 0; i < clusteredNodes.length; i++) {
                let ciseOnCircleNode = clusteredNodes[i];

                let avsdfNode = avsdfLayout.newNode(null);
                let loc = ciseOnCircleNode.getLocation();
                avsdfNode.setLocation(loc.x, loc.y);
                avsdfNode.setWidth(ciseOnCircleNode.getWidth());
                avsdfNode.setHeight(ciseOnCircleNode.getHeight());
                avsdfCircle.add(avsdfNode);

                ciseToAvsdf.put(ciseOnCircleNode, avsdfNode);
            }

            // For each edge, create a corresponding AVSDF edge if its both ends
            // are in this cluster.
            let allEdges = this.getAllEdges();
            for(let i = 0; i < allEdges.length; i++) {
                let edge = allEdges[i];

                if(clusteredNodes.includes( edge.getSource() ) && clusteredNodes.includes( edge.getTarget() )){
                    let avsdfSource = ciseToAvsdf.get( edge.getSource() );
                    let avsdfTarget = ciseToAvsdf.get( edge.getTarget() );
                    let avsdfEdge = avsdfLayout.newEdge("");

                    avsdfCircle.add(avsdfEdge, avsdfSource, avsdfTarget);
                }
            }

            // Run AVSDF layout
            avsdfLayout.layout();

            // Do post-processing
            let sortedByDegreeList = avsdfLayout.initPostProcess();
            for(let i = 0; i < sortedByDegreeList.length; i++){
                avsdfLayout.oneStepPostProcess(sortedByDegreeList[i]);
            }
            avsdfLayout.updateNodeAngles();
            avsdfLayout.updateNodeCoordinates();

            // Reflect changes back to CiSENode's
            for(let i = 0; i < clusteredNodes.length; i++){
                let ciseOnCircleNode = clusteredNodes[i];
                let avsdfNode = ciseToAvsdf.get(ciseOnCircleNode);
                let loc = avsdfNode.getLocation();
                ciseOnCircleNode.setLocation(loc.x, loc.y);
                ciseOnCircleNode.getOnCircleNodeExt().setIndex(avsdfNode.getIndex());
                ciseOnCircleNode.getOnCircleNodeExt().setAngle(avsdfNode.getAngle());
            }

            // Sort nodes of this ciseCircle according to circle indexes of
            // ciseOnCircleNodes.
            clusteredNodes.sort(function(a, b) {
                return a.getOnCircleNodeExt().getIndex() - b.getOnCircleNodeExt().getIndex();
            });

            // Assign width and height of the AVSDF circle containing the nodes
            // above to the corresponding cise-circle.
            if (avsdfCircle.getNodes().length > 0)
            {
                let parentCiSE = graph.getParent();
                let parentAVSDF = avsdfCircle.getParent();
                parentCiSE.setLocation(parentAVSDF.getLocation().x, parentAVSDF.getLocation().y);
                graph.setRadius(avsdfCircle.getRadius());
                graph.calculateParentNodeDimension();
            }

        }
    }
};

/**
 * This method runs a spring embedder on the cluster-graph (quotient graph
 * of the clustered graph) to determine initial layout.
 */
CiSELayout.prototype.doStep2 = function(){
    this.step = CiSELayout.STEP_2;
    this.phase = CiSELayout.PHASE_OTHER;
    let newCoSENodes = [];
    let newCoSEEdges = [];

    // Used for holding conversion mapping between cise and cose nodes.
    let ciseNodeToCoseNode = new HashMap();

    // Used for reverse mapping between cose and cise edges while sorting
    // incident edges.
    let coseEdgeToCiseEdges = new HashMap();

    // Create a CoSE layout object
    let coseLayout = new CoSELayout();
    coseLayout.isSubLayout = false;
    coseLayout.useMultiLevelScaling = false;
    coseLayout.useFRGridVariant = true;
    coseLayout.springConstant *= 1.5;

    let gm = coseLayout.newGraphManager();
    let coseRoot = gm.addRoot();

    // Traverse through all nodes and create new CoSENode's.
    // !WARNING! = REMEMBER to set unique "id" properties to CoSENodes!!!!
    let nonOnCircleNodes = this.graphManager.getNonOnCircleNodes();
    for (let i = 0; i < nonOnCircleNodes.length; i++){
        let ciseNode = nonOnCircleNodes[i];

        let newNode = coseLayout.newNode(null);
        let loc = ciseNode.getLocation();
        newNode.setLocation(loc.x, loc.y);
        newNode.setWidth(ciseNode.getWidth());
        newNode.setHeight(ciseNode.getHeight());

        // Set nodes corresponding to circles to be larger than original, so
        // inter-cluster edges end up longer.
        if (ciseNode.getChild() != null)
        {
            newNode.setWidth(1.2 * newNode.getWidth());
            newNode.setHeight(1.2 * newNode.getHeight());
        }

        // !WARNING! = CoSE EXPECTS "id" PROPERTY IMPLICITLY, REMOVING IT WILL CAUSE TILING TO OCCUR ON THE WHOLE GRAPH
        newNode.id = i;

        coseRoot.add(newNode);
        newCoSENodes.push(newNode);
        ciseNodeToCoseNode.put(ciseNode, newNode);
    }

    // Used for preventing duplicate edge creation between two cose nodes
    let nodePairs = new Array(newCoSENodes.length);
    for(let i = 0; i < nodePairs.length; i++){
        nodePairs[i] = new Array(newCoSENodes.length);
    }

    // Traverse through edges and create cose edges for inter-cluster ones.
    let allEdges = this.graphManager.getAllEdges();
    for (let i = 0; i < allEdges.length; i++ ){
        let ciseEdge = allEdges[i];
        let sourceCise = ciseEdge.getSource();
        let targetCise = ciseEdge.getTarget();

        // Determine source and target nodes for current edge
        if (sourceCise.getOnCircleNodeExt() != null){
            // Source node is an on-circle node, take its parent as source node
            sourceCise = ciseEdge.getSource().getOwner().getParent();
        }
        if (targetCise.getOnCircleNodeExt() != null){
            // Target node is an on-circle node, take its parent as target node
            targetCise = ciseEdge.getTarget().getOwner().getParent();
        }

        let sourceCose = ciseNodeToCoseNode.get(sourceCise);
        let targetCose = ciseNodeToCoseNode.get(targetCise);
        let sourceIndex = newCoSENodes.indexOf(sourceCose);
        let targetIndex = newCoSENodes.indexOf(targetCose);

        let newEdge;
        if (sourceIndex !== targetIndex){
            // Make sure it's an inter-cluster edge

            if (nodePairs[sourceIndex][targetIndex] == null &&
                nodePairs[targetIndex][sourceIndex] == null)
            {
                newEdge = coseLayout.newEdge(null);
                coseRoot.add(newEdge, sourceCose, targetCose);
                newCoSEEdges.push(newEdge);

                coseEdgeToCiseEdges.put(newEdge,[]);

                nodePairs[sourceIndex][targetIndex] = newEdge;
                nodePairs[targetIndex][sourceIndex] = newEdge;
            }
            else
            {
                newEdge =  nodePairs[sourceIndex][targetIndex];
            }

            coseEdgeToCiseEdges.get(newEdge).push(ciseEdge);
        }
    }

    // Run CoSELayout
    coseLayout.runLayout();

    // Reflect changes back to cise nodes
    // First update all non-on-circle nodes.
    for (let i = 0; i < nonOnCircleNodes.length; i++)
    {
        let ciseNode = nonOnCircleNodes[i];
        let coseNode = ciseNodeToCoseNode.get(ciseNode);
        let loc = coseNode.getLocation();
        ciseNode.setLocation(loc.x, loc.y);
    }

    // Then update all cise on-circle nodes, since their parents have
    // changed location.

    let onCircleNodes = this.graphManager.getOnCircleNodes();

    for (let i = 0; i < onCircleNodes.length; i++)
    {
        let ciseNode = onCircleNodes[i];
        let loc = ciseNode.getLocation();
        let parentLoc = ciseNode.getOwner().getParent().getLocation();
        ciseNode.setLocation(loc.x + parentLoc.x, loc.y + parentLoc.y);
    }

};

/**
 * This method runs a modified spring embedder as described by the CiSE
 * layout algorithm where the on-circle nodes are fixed (pinned down to
 * the location on their owner circle). Circles, however, are allowed to be
 * flipped (i.e. nodes are re-ordered in the reverse direction) if reversal
 * yields a better aligned neighborhood (w.r.t. its inter-graph edges).
 */
CiSELayout.prototype.step3Init = function(){
    this.step = CiSELayout.STEP_3;
    this.phase = CiSELayout.PHASE_OTHER;
    this.initSpringEmbedder();
    this.coolingCycle = 0;
};

/**
 * This method runs a modified spring embedder as described by the CiSE
 * layout algorithm where the neighboring on-circle nodes are allowed to
 * move by swapping without increasing crossing number but circles are not
 * allowed to be flipped.
 */
CiSELayout.prototype.step4Init = function() {
    this.step = CiSELayout.STEP_4;
    this.phase = CiSELayout.PHASE_OTHER;
    this.initSpringEmbedder();
    for (let i = 0; i < this.graphManager.getOnCircleNodes().length ; i++)
    {
        this.graphManager.getOnCircleNodes()[i].getOnCircleNodeExt().updateSwappingConditions();
    }
    this.coolingCycle = 0;
};

/**
 * This method runs a modified spring embedder as described by the CiSE
 * layout algorithm where the on-circle nodes are fixed (pinned down to
 * the location on their owner circle) and circles are not allowed to be
 * flipped.
 */
CiSELayout.prototype.step5Init = function(){
    this.step = CiSELayout.STEP_5;
    this.phase = CiSELayout.PHASE_OTHER;
    this.initSpringEmbedder();
    this.coolingCycle = 0;
};

/**
 * This method implements a spring embedder used by steps 3 thru 5 with
 * potentially different parameters.
 *
 */
CiSELayout.prototype.runSpringEmbedderTick = function (){
    // This function uses iterations but FDLayout uses this.totalIterations
    this.iterations++;
    this.totalIterations = this.iterations;

    if ( (this.iterations % CiSEConstants.CONVERGENCE_CHECK_PERIOD) === 0)
    {
        // In step 4 make sure at least a 1/4 of max iters take place
        let notTooEarly = this.step !== CiSELayout.STEP_4 || this.iterations > this.maxIterations / 4;

        if ( notTooEarly && this.isConverged() )
        {
            return true;
        }

        // Cooling factor descend function
        //this.coolingFactor = this.initialCoolingFactor * Math.pow( 1 - 0.005 , this.iterations) ;

       this.coolingFactor = this.initialCoolingFactor * ((this.maxIterations - this.iterations) / this.maxIterations);
    }

    this.totalDisplacement = 0;

    if (this.step === CiSELayout.STEP_3)
    {
        if (this.iterations % CiSEConstants.REVERSE_PERIOD === 0)
        {
            this.checkAndReverseIfReverseIsBetter();
        }
    }
    else if (this.step === CiSELayout.STEP_4)
    {
        // clear history every now and then
        if (this.iterations % CiSEConstants.SWAP_HISTORY_CLEARANCE_PERIOD === 0)
        {
            this.swappedPairsInLastIteration = [];
        }

        // no of iterations in this swap period
        let iterationInPeriod = this.iterations % CiSEConstants.SWAP_PERIOD;

        if (iterationInPeriod >= CiSEConstants.SWAP_IDLE_DURATION)
        {
            this.phase = CiSELayout.PHASE_SWAP_PREPERATION;
        }
        else if (iterationInPeriod === 0)
        {
            this.phase = CiSELayout.PHASE_PERFORM_SWAP;
        }
        else
        {
            this.phase = CiSELayout.PHASE_OTHER;
        }
    }

    this.calcSpringForces();
    this.calcRepulsionForces();
    this.calcGravitationalForces();
    this.calcTotalForces();
    this.moveNodes();

    return this.iterations >= this.maxIterations;
};

/**
 * This method prepares circles for possible reversal by computing the order
 * matrix of each circle. It also determines any circles that should never
 * be reversed (e.g. when it has no more than 1 inter-cluster edge).
 */

CiSELayout.prototype.prepareCirclesForReversal = function()
{
    let nodes = this.graphManager.getRoot().getNodes();
    nodes.forEach(function(node){
        let circle = node.getChild();
        if(circle !== null && circle !== undefined){ //It is a circle
            if (circle.getInterClusterEdges().length < 2)
                circle.setMayNotBeReversed();

            circle.computeOrderMatrix();
        }
    });
};

/**
 * This method calculates the ideal edge length of each edge. Here we relax
 * edge lengths in the polishing step and keep the edge lengths of the edges
 * incident with inner-nodes very short to avoid overlaps.
 */
CiSELayout.prototype.calcIdealEdgeLengths = function(isPolishingStep){
    let lEdges = this.graphManager.getAllEdges();
    for(let i = 0; i < lEdges.length; i++){
        let edge = lEdges[i];

        // Loosen in the polishing step to avoid overlaps
        if(isPolishingStep)
            edge.idealLength = 1.5 * this.idealEdgeLength * this.idealInterClusterEdgeLengthCoefficient;
        else
            edge.idealLength = this.idealEdgeLength * this.idealInterClusterEdgeLengthCoefficient;
    }

    // Update in-nodes edge's lengths
    let lNodes = this.graphManager.getInCircleNodes();
    for(let i = 0; i < lNodes.length; i++){
        let node = lNodes[i];

        node.getEdges().forEach(function (edge){
            edge.idealLength = CiSEConstants.DEFAULT_INNER_EDGE_LENGTH;
        });
    }
};

/**
 * This method calculates the spring forces applied to end nodes of each
 * edge. In steps 3 & 5, where on-circle nodes are not allowed to move,
 * intra-cluster edges are ignored (as their total will equal zero and won't
 * have an affect on the owner circle).
 */
CiSELayout.prototype.calcSpringForces = function(){
    let lEdges = this.graphManager.getAllEdges();
    for(let i = 0; i < lEdges.length; i++){
        let edge = lEdges[i];
        let source = edge.getSource();
        let target = edge.getTarget();

        // Ignore intra-cluster edges (all steps 3 thru 5) except for those
        // incident w/ any inner-nodes
        if (edge.isIntraCluster &&
            source.getOnCircleNodeExt() != null &&
            target.getOnCircleNodeExt() != null)
        {
            continue;
        }

        this.calcSpringForce(edge, edge.idealLength);
    }
};

/**
 * This method calculates the repulsion forces for each pair of nodes.
 * Repulsions need not be calculated for on-circle nodes.
 */
CiSELayout.prototype.calcRepulsionForces = function() {
    let lNodes = this.graphManager.getNonOnCircleNodes();
    for(let i = 0; i < lNodes.length; i++){
        let nodeA = lNodes[i];
        for(let j = i + 1; j < lNodes.length; j++){
            let nodeB = lNodes[j];

            this.calcRepulsionForce(nodeA, nodeB);
        }
    }

    // We need the calculate repulsion forces for in-circle nodes as well
    // to keep them inside circle.
    let inCircleNodes = this.graphManager.getInCircleNodes();
    for (let i = 0; i < inCircleNodes.length; i++) {
        let inCircleNode = inCircleNodes[i];
        let ownerCircle = inCircleNode.getOwner();

        //TODO: inner nodes repulse on-circle nodes as well, not desired!
        // Calculate repulsion forces with all nodes inside the owner circle
        // of this inner node.

        let childNodes = ownerCircle.getNodes();
        for(let i = 0; i < childNodes.length; i++){
            let childCiSENode = childNodes[i];

            if (childCiSENode !== inCircleNode)
            {
                this.calcRepulsionForce(inCircleNode, childCiSENode);
            }
        }
    }
};

/**
 * This method calculates the gravitational forces for each node. On-circle
 * nodes move with their owner; thus they are not applied separate gravity.
 */
CiSELayout.prototype.calcGravitationalForces = function () {
    if (!this.graphManager.rootGraph.isConnected) {
        let lNodes = this.graphManager.getNonOnCircleNodes();

        for (let i = 0; i < lNodes.length; i++)
        {
            let node = lNodes[i];
            this.calcGravitationalForce(node);
        }
    }

    // Calculate gravitational forces to keep in-circle nodes in the center
    // TODO: is this really helping or necessary?
    let lNodes = this.graphManager.getInCircleNodes();

    for (let i = 0; i < lNodes.length; i++)
    {
        let node = lNodes[i];
        this.calcGravitationalForce(node);
    }
};

/**
 * This method adds up all the forces calculated earlier transferring forces
 * of on-circle nodes to their owner node (as regular and rotational forces)
 * when they are not allowed to move. When they are allowed to move,
 * on-circle nodes will partially contribute to the forces of their owner
 * circle (no rotational contribution).
 */
CiSELayout.prototype.calcTotalForces = function(){
    let allNodes = this.graphManager.getAllNodes();

    for(let i = 0; i < allNodes.length; i++){
        let node = allNodes[i];

        node.displacementX = this.coolingFactor * (node.springForceX + node.repulsionForceX + node.gravitationForceX);
        node.displacementY = this.coolingFactor * (node.springForceY + node.repulsionForceY + node.gravitationForceY);

        node.rotationAmount = 0.0;

        node.springForceX = 0.0;
        node.springForceY = 0.0;
        node.repulsionForceX = 0.0;
        node.repulsionForceY = 0.0;
        node.gravitationForceX = 0.0;
        node.gravitationForceY = 0.0;
    }

    let onCircleNodes = this.graphManager.getOnCircleNodes();
    for (let i = 0; i < onCircleNodes.length; i++)
    {
        let node = onCircleNodes[i];
        let parentNode = node.getOwner().getParent();
        let values = node.getOwner().decomposeForce(node);

        if(this.phase === CiSELayout.PHASE_SWAP_PREPERATION){
            node.getOnCircleNodeExt().addDisplacementForSwap(values.getRotationAmount());
        }

        parentNode.displacementX += values.getDisplacementX();
        parentNode.displacementY += values.getDisplacementY();
        node.displacementX = 0.0;
        node.displacementY = 0.0;

        parentNode.rotationAmount += values.getRotationAmount();
        node.rotationAmount = 0.0;
    }
};

/**
 * This method updates positions of each node at the end of an iteration.
 * Also, it deals with swapping of two consecutive nodes on a circle in
 * step 4.
 */
CiSELayout.prototype.moveNodes = function(){
    if (this.phase !== CiSELayout.PHASE_PERFORM_SWAP)
    {
        let nonOnCircleNodes = this.graphManager.getNonOnCircleNodes();

        // Simply move all non-on-circle nodes.
        for (let i = 0; i < nonOnCircleNodes.length; i++)
        {
            nonOnCircleNodes[i].move();

            // Also make required rotations for circles
            if (nonOnCircleNodes[i].getChild() !== null && nonOnCircleNodes[i].getChild() !== undefined )
            {
                nonOnCircleNodes[i].getChild().rotate();
            }
        }

        // Also move all in-circle nodes. Note that in-circle nodes will be
        // empty if this option is not set, hence no negative effect on
        // performance

        let inCircleNodes = this.graphManager.getInCircleNodes();
        let inCircleNode;

        for (let i = 0; i < inCircleNodes.length; i++)
        {
            inCircleNode = inCircleNodes[i];
            // TODO: workaround to force inner nodes to stay inside
            inCircleNode.displacementX /= 20.0;
            inCircleNode.displacementY /= 20.0;
            inCircleNode.move();
        }

    } else {
        // If in perform-swap phase of step 4, we have to look for swappings
        // that do not increase edge crossings and is likely to decrease total
        // energy.
        let ciseOnCircleNodes = this.graphManager.getOnCircleNodes();
        let size = ciseOnCircleNodes.length;

        // Both nodes of a pair are out-nodes, not necessarilly safe due to
        // inter-cluster edge crossings
        // TODO It should be a max heap structure
        let nonSafePairs = [];

        // Pairs where one of the on circle nodes is an in-node; no problem
        // swapping these
        let safePairs = [];

        // Nodes swapped in this round
        let swappedNodes = [];

        // Pairs swapped or prevented from being swapped in this round
        let swappedPairs = [];

        let firstNode;
        let secondNode;
        let firstNodeExt;
        let secondNodeExt;
        let firstNodeDisp;
        let secondNodeDisp;
        let discrepancy;
        let inSameDirection;

        // Check each node with its next node for swapping
        for (let i = 0; i < size; i++) {
            firstNode = ciseOnCircleNodes[i];
            secondNode = firstNode.getOnCircleNodeExt().getNextNode();
            firstNodeExt = firstNode.getOnCircleNodeExt();
            secondNodeExt = secondNode.getOnCircleNodeExt();

            // Ignore if the swap is to introduce new intra-edge crossings
            if (!firstNodeExt.canSwapWithNext || !secondNodeExt.canSwapWithPrev)
                continue;

            firstNodeDisp = firstNodeExt.getDisplacementForSwap();
            secondNodeDisp = secondNodeExt.getDisplacementForSwap();
            discrepancy = firstNodeDisp - secondNodeDisp;

            // Pulling in reverse directions, no swap
            if (discrepancy < 0.0)
                continue;

            // Might swap, create safe or nonsafe node pairs
            inSameDirection = (firstNodeDisp > 0 && secondNodeDisp > 0) || (firstNodeDisp < 0 && secondNodeDisp < 0);
            let pair = new CiSEOnCircleNodePair(firstNode,
                secondNode,
                discrepancy,
                inSameDirection);

            // When both are out-nodes, nonsafe; otherwise, safe
            if (firstNodeDisp === 0.0 || secondNodeDisp === 0.0)
                safePairs.push(pair);
            else
                nonSafePairs.push(pair);
        }

            let nonSafePair;
            let lookForSwap = true;
            let rollback;

            // TODO max heap -> extractMax
            nonSafePairs.sort(function(a, b) {
                return a.getDiscrepancy() - b.getDiscrepancy(); });

            // Look for a nonsafe pair until we swap one
            while (lookForSwap && nonSafePairs.length > 0)
            {
                // Pick the non safe pair that has the maximum discrepancy.
                nonSafePair = nonSafePairs[nonSafePairs.length - 1];
                firstNode = nonSafePair.getFirstNode();
                secondNode = nonSafePair.getSecondNode();
                firstNodeExt = firstNode.getOnCircleNodeExt();
                secondNodeExt = secondNode.getOnCircleNodeExt();

                // If this pair is swapped in previous swap phase, don't allow
                // this swap. Also save it for the future as if it is actually
                // swapped in order to prevent future oscilations
                if (this.isSwappedPreviously(nonSafePair))
                {
                    nonSafePairs.pop();
                    swappedPairs.push(nonSafePair);
                    continue;
                }

                // Check for inter-cluster edge crossings before swapping.
                let int1 = firstNodeExt.getInterClusterIntersections(secondNodeExt);

                // Try a swap
                nonSafePair.swap();
                rollback = false;

                // Then re-compute crossings
                let int2 = firstNodeExt.getInterClusterIntersections(secondNodeExt);

                // Possible cases regarding discrepancy:
                // first  second  action
                // +      +       both clockwise: might swap if disp > 0
                // +      -       disp > 0: might swap
                // -      -       both counter-clockwise: might swap if disp > 0
                // -      +       disp <= 0: no swap

                // Under following conditions roll swap back:
                // - swap increases inter-cluster edge crossings
                // - inter-cluster edge number is the same but pulling in the
                // same direction or discrepancy is below pre-determined
                // threshold (not enough for swap)

                rollback = int2 > int1;

                if (!rollback && int2 === int1)
                {
                    rollback =
                        nonSafePair.inSameDirection() ||
                        nonSafePair.getDiscrepancy() <
                        CiSEConstants.MIN_DISPLACEMENT_FOR_SWAP;
                }

                if (rollback)
                {
                    nonSafePair.swap();
                    nonSafePairs.pop();
                    continue;
                }

                swappedNodes.push(nonSafePair.getFirstNode());
                swappedNodes.push(nonSafePair.getSecondNode());
                swappedPairs.push(nonSafePair);

                // Swap performed, do not look for another nonsafe pair
                lookForSwap = false;
            }

            // Now process all safe pairs
            for ( let i = 0; i < safePairs.length; i ++){
                let safePair = safePairs[i];

                // Check if discrepancy is above the threshold (enough to swap)
                if (safePair.inSameDirection() ||
                    safePair.getDiscrepancy() <
                    CiSEConstants.MIN_DISPLACEMENT_FOR_SWAP) {
                    continue;
                }

                // Check if they were already involved in a swap in this phase
                if (swappedNodes.includes(safePair.getFirstNode()) ||
                    swappedNodes.includes(safePair.getSecondNode())) {
                    continue;
                }

                // Should be swapped if not previously swapped; so
                // Check if they were previously swapped
                if (!this.isSwappedPreviously(safePair))
                {
                    safePair.swap();
                    swappedNodes.push(safePair.getFirstNode());
                    swappedNodes.push(safePair.getSecondNode());
                }

                // Mark swapped (even if not) to prevent future oscillations
                swappedPairs.push(safePair);
            }

            // Update swap history
            this.swappedPairsInLastIteration = [];
            for (let i = 0; i < swappedPairs.length; i++)
            {
                this.swappedPairsInLastIteration.push(swappedPairs[i]);
            }

            // Reset all discrepancy values of on circle nodes.
            let node;

            for (let i = 0; i < size; i++)
            {
                node = ciseOnCircleNodes[i];
                node.getOnCircleNodeExt().setDisplacementForSwap(0.0);
            }
    }
};

/*
 * This method returns whether or not the input node pair was previously
 * swapped.
 */
CiSELayout.prototype.isSwappedPreviously = function(pair) {
    for(let i = 0; i < this.swappedPairsInLastIteration.length; i++) {
        let swappedPair = this.swappedPairsInLastIteration[i];

        if ((swappedPair.getFirstNode() === pair.getFirstNode() &&
            swappedPair.getSecondNode() === pair.getSecondNode()) ||
            (swappedPair.getSecondNode() === pair.getFirstNode() &&
                swappedPair.getFirstNode() === pair.getSecondNode())) {
            return true;
        }
    }

    return false;
};

/**
* This method tries to improve the edge crossing number by reversing a
* cluster (i.e., the order of the nodes in the cluster such as C,B,A
* instead of A,B,C). No more than one reversal is performed with each
* execution. The decision is based on the global sequence alignment
* heuristic (typically used in biological sequence alignment). A cluster
* that was previsouly reversed is not a candidate for reversal to avoid
* oscillations. It returns true if a reversal has been performed.
*/
CiSELayout.prototype.checkAndReverseIfReverseIsBetter = function () {
    let gm = this.getGraphManager();

    // For each cluster (in no particular order) check to see whether
    // reversing the order of the nodes on the cluster could improve on
    // inter-graph edge crossing number of that cluster.

    let nodeIterator = gm.getRoot().getNodes();
    let node;
    let circle;

    for (let i = 0; i < nodeIterator.length; i++)
    {
        node = nodeIterator[i];
        circle = node.getChild();

        if (circle != null &&
            circle.getMayBeReversed() &&
            circle.getNodes().length <= 52)
        {
            if (circle.checkAndReverseIfReverseIsBetter())
            {
                return true;
            }
        }
    }

    return false;
};

/**
 * This method goes over all circles and tries to find nodes that can be
 * moved inside the circle. Inner nodes are found and moved inside one at a
 * time. This process continues for a circle until either there is no inner
 * node or reached max inner nodes for that circle.
 */
CiSELayout.prototype.findAndMoveInnerNodes = function (){
    if (!this.allowNodesInsideCircle)
    {
        return;
    }

    let graphs = this.graphManager.getGraphs();
    for (let i = 0; i < graphs.length; i++){
        let ciseCircle = graphs[i];

        // Count inner nodes not to exceed user defined maximum
        let innerNodeCount = 0;

        if (ciseCircle !== this.getGraphManager().getRoot())
        {
            // It is a user parameter, retrieve it.
            let maxInnerNodes = ciseCircle.getNodes().length * this.maxRatioOfNodesInsideCircle;

            // Look for an inner node and move it inside
            let innerNode = this.findInnerNode(ciseCircle);

            while (innerNode !== null && innerNode !== undefined && innerNodeCount < maxInnerNodes)
            {
                this.moveInnerNode(innerNode);
                innerNodeCount++;

                if (innerNodeCount < maxInnerNodes)
                {
                    innerNode = this.findInnerNode(ciseCircle);
                }
            }
        }
    }
};

/**
 * This method finds an inner node (if any) in the given circle.
 */
CiSELayout.prototype.findInnerNode = function (ciseCircle){
    let innerNode = null;
    let onCircleNodeCount = ciseCircle.getOnCircleNodes().length;

    // First sort the nodes in the circle according to their degrees.
    let sortedNodes = ciseCircle.getOnCircleNodes();
    sortedNodes.sort(function(a, b) {
        return a.getEdges().length - b.getEdges().length;
    });

    // Evaluate each node as possible candidate
    for (let i = onCircleNodeCount - 1; i >= 0 && innerNode == null; i--)
    {
        let candidateNode = sortedNodes[i];

        // Out nodes cannot be moved inside, so just skip them
        if (candidateNode.getOnCircleNodeExt().getInterClusterEdges().length !== 0)
        {
            continue;
        }

        let circleSegment = this.findMinimalSpanningSegment(candidateNode);

        // Skip nodes with no neighbors (circle segment will be empty)
        if (circleSegment.length === 0)
        {
            continue;
        }

        // For all nodes in the spanning circle segment, check if that node
        // is connected to another node on the circle with an index diff of
        // greater than 1 (i.e. connected to a non-immediate neighbor)

        let connectedToNonImmediate = false;

        for(let i = 0; i < circleSegment.length; i++) {
            let spanningNode = circleSegment[i];

            // Performance improvement: stop iteration if this cannot be
            // an inner node.
            if (connectedToNonImmediate) {
                break;
            }

            // Look for neighbors of this spanning node.
            let neighbors = spanningNode.getNeighborsList();
            for (let j = 0; j < neighbors.length; j++) {
                let neighborOfSpanningNode = neighbors[j];

                // In some case we don't need to look at the neighborhood
                // relationship. We won't care the neighbor of spanning node
                // if:
                // - It is the candidate node
                // - It is on another circle
                // - It is already an inner node.
                if (neighborOfSpanningNode !== candidateNode &&
                    neighborOfSpanningNode.getOwner() === ciseCircle &&
                    neighborOfSpanningNode.getOnCircleNodeExt() != null &&
                    neighborOfSpanningNode.getOnCircleNodeExt() != undefined) {

                    let spanningIndex = spanningNode.getOnCircleNodeExt().getIndex();
                    let neighborOfSpanningIndex = neighborOfSpanningNode.getOnCircleNodeExt().getIndex();

                    // Calculate the index difference between spanning node
                    // and its neighbor
                    let indexDiff = spanningIndex - neighborOfSpanningIndex;
                    indexDiff += onCircleNodeCount; // Get rid of neg. index
                    indexDiff %= onCircleNodeCount; // Mod it

                    // Give one more chance, try reverse order of nodes
                    // just in case.
                    if (indexDiff > 1) {
                        indexDiff = neighborOfSpanningIndex - spanningIndex;
                        indexDiff += onCircleNodeCount; // Get rid of neg.
                        indexDiff %= onCircleNodeCount; // Mod it
                    }

                    // If the diff is still greater 1, this spanning node
                    // has a non-immediate neighbor. Sorry but you cannot
                    // be an inner node. Poor candidate node !!!
                    if (indexDiff > 1) {
                        connectedToNonImmediate = true;
                        // stop computation.
                        break;
                    }
                }
            }
        }

        // If neighbors of candidate node is not connect to a non-immediate
        // neighbor that this can be an inner node.
        if (!connectedToNonImmediate)
        {
            innerNode = candidateNode;
        }

    }

    return innerNode;
};

/**
 * This method safely removes inner node from circle perimeter (on-circle)
 * and moves them inside their owner circles (as in-circle nodes)
 */
CiSELayout.prototype.moveInnerNode = function (innerNode)
{
    let ciseCircle = innerNode.getOwner();

    // Remove the node from the circle first. This forces circle to
    // re-adjust its geometry. A costly operation indeed...
    ciseCircle.moveOnCircleNodeInside(innerNode);

    // We need to also remove the inner node from on-circle nodes list
    // of the associated graph manager
    let onCircleNodesList = this.graphManager.getOnCircleNodes();
    let index = onCircleNodesList.indexOf(innerNode);
    if( index > -1){
        onCircleNodesList.splice(index, 1);
    }

    this.graphManager.inCircleNodes.push(innerNode);
};

/**
 * This method returns a circular segment (ordered array of nodes),
 * which is the smallest segment that spans neighbors of the given node.
 */
CiSELayout.prototype.findMinimalSpanningSegment = function (node)
{
    let segment = [];

    // First create an ordered neighbors list which includes given node and
    // its neighbors and ordered according to their indexes in this circle.
    let orderedNeigbors = node.getOnCircleNeighbors();

    if (orderedNeigbors.length === 0)
    {
        return segment;
    }

    orderedNeigbors.sort(function(a, b) {
        return a.getOnCircleNodeExt().getIndex() - b.getOnCircleNodeExt().getIndex();
    });

    // According to the order found, find the start and end nodes of the
    // segment by testing each (order adjacent) neighbor pair.
    let orderedNodes = node.getOwner().getOnCircleNodes();
    orderedNodes.sort(function(a, b) {
        return a.getOnCircleNodeExt().getIndex() - b.getOnCircleNodeExt().getIndex();
    });

    let shortestSegmentStartNode = null;
    let shortestSegmentEndNode = null;
    let shortestSegmentLength = orderedNodes.length;
    let segmentLength = orderedNodes.length;
    let neighSize = orderedNeigbors.length;
    let i;
    let j;
    let tempSegmentStartNode;
    let tempSegmentEndNode;
    let tempSegmentLength;

    for (i = 0; i < neighSize; i++)
    {
        j = ((i - 1) + neighSize) % neighSize;

        tempSegmentStartNode = orderedNeigbors[i];
        tempSegmentEndNode = orderedNeigbors[j];

        tempSegmentLength =
            (tempSegmentEndNode.getOnCircleNodeExt().getIndex() - tempSegmentStartNode.getOnCircleNodeExt().getIndex() +
                segmentLength) % segmentLength + 1;

        if (tempSegmentLength < shortestSegmentLength)
        {
            shortestSegmentStartNode = tempSegmentStartNode;
            shortestSegmentEndNode = tempSegmentEndNode;
            shortestSegmentLength = tempSegmentLength;
        }
    }

    // After finding start and end nodes for the segment, simply go over
    // ordered nodes and create an ordered list of nodes in the segment

    let segmentEndReached = false;
    let currentNode = shortestSegmentStartNode;

    while (!segmentEndReached)
    {
        if (currentNode !== node)
        {
            segment.push(currentNode);
        }

        if (currentNode === shortestSegmentEndNode)
        {
            segmentEndReached = true;
        }
        else
        {
            let nextIndex = currentNode.getOnCircleNodeExt().getIndex() + 1;

            if (nextIndex === orderedNodes.length)
            {
                nextIndex = 0;
            }

            currentNode = orderedNodes[nextIndex];
        }
    }

    return segment;
};

module.exports = CiSELayout;