avsdf-base
================================================================================

## Description

 avsdf-base is a JavaScript library that constitutes of elements helpful in applying the [Circular Drawing Algorithm](https://www.researchgate.net/publication/229019459_New_circular_drawing_algorithms) by Hongmei He & Ondrej Sýkora.
 
 ## Dependencies
 
 * layout-base ^1.0.0
 
 Elements of layout-base can be accessed through this library as well. See below for an example.
 
 ## Usage
  
 Add `avsdf-base` as a dependecy to your layout extension.
 
 `require()` in the extension to reach functionality:
 
```js
const AVSDFLayout = require('avsdf-base').AVSDFLayout;
const AVSDFNode = require('avsdf-base').AVSDFNode;
const AVSDFConstants = require('avsdf-base').AVSDFConstants;
const PointD = require('avsdf-base').layoutBase.PointD;
const DimensionD = require('avsdf-base').layoutBase.DimensionD;
```

## API

The main layout and a Graph Manager (see layout-base for details) connected to this layout is needed with 

```js
let avsdfLayout = new AVSDFLayout();
let graphManager = avsdfLayout.newGraphManager();
let root = graphManager.addRoot();
```
Filling in the Graph Manager with nodes and edges are more related to layout-base library than this library. So details have to be found there. But remember to add AVSDF elements as
 opposed to layout-base elements. Also remember that the root of the Graph Manager should be an AVSDFCircle object. 
 
```js
// Adding a node 
Let node = root.add(new AVSDFNode(graphManager));

// Adding an edge
Let edge = graphManager.add(avsdfLayout.newEdge(), sourceNode, targetNode);
```

After all nodes and edges are added. The algorithm can be run as shown below. 

```js
// Running the AVSDF layout.
avsdfLayout.layout();

// Post process is iterated over the sorted list of vertex degrees (descending)
let sortedByDegreeList = avsdfLayout.initPostProcess();

// Post process is done step by step so that it could be displayed more efficiently
for (node in sortedByDegreeList) {
  avsdfLayout.oneStepPostProcess(node);
}

// An update for the angles (in radians) for the node angles are needed
avsdfLayout.updateNodeAngles();

// An update for the node coordinates are needed 
avsdfLayout.updateNodeCoordinates();
```

Note that updateNodeAngles() and updateNodeCoordinates() have to be called at each step if you want to take post processing apart instead of doing it in one go as shown above.
