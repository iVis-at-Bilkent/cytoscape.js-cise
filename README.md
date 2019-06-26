cytoscape.js-cise
================================================================================


## Description

CiSE(Circular Spring Embedder) is an algorithm based on the traditional force-directed layout scheme with extensions to move and rotate nodes in the same cluster as a group. Further local improvements may be obtained by flipping clusters and by swapping neighboring node pairs in the same cluster, reducing the edge crossing number.

The algorithm is implemented as a Cytoscape.js extension by [i-Vis Lab](http://cs.bilkent.edu.tr/~ivis/) in Bilkent University ([demo](https://ivis-at-bilkent.github.io/cytoscape.js-cise/demo.html))

Please cite the following when using this layout:

M. Belviranli, A. Dilek and U. Dogrusoz, "[CiSE: A Circular Spring Embedder Layout Algorithm](https://dlnext.acm.org/doi/abs/10.1109/TVCG.2012.178)" in IEEE Transactions on Visualization & Computer Graphics, vol. 19, no. 06, pp. 953-966, 2013.

<p align="center"><img src="demo.gif" width="526" height="411"></p>

A detailed illustration of CiSE can also be found [here.](https://www.youtube.com/watch?v=SMDAQajK-E8)

## Dependencies

 * Cytoscape.js: ^3.2.0
 * avsdf-base: ^1.0.0
 * cose-base: ^1.0.0

## Usage instructions

Download the library:
 * via npm: `npm install cytoscape-cise`,
 * via bower: `bower install cytoscape-cise`, or
 * via direct download in the repository (probably from a tag).

Import the library as appropriate for your project:

ES import:

```js
import cytoscape from 'cytoscape';
import cise from 'cytoscape-cise';

cytoscape.use( cise );
```

CommonJS require:

```js
let cytoscape = require('cytoscape');
let cise = require('cytoscape-cise');

cytoscape.use( cise ); // register extension
```

AMD:

```js
require(['cytoscape', 'cytoscape-cise'], function( cytoscape, cise ){
  cise( cytoscape ); // register extension
});
```

Plain HTML/JS has the extension registered for you automatically, because no `require()` is needed.


## API

The following options are supported when calling the layout, e.g,
 
`cy.layout({ name: 'cise', clusters: clusterInfo, ... }):`

```js
var default = {
    // -------- Mandatory parameters --------
    name = 'cise',
    
    // ClusterInfo can be a 2D array contaning node id's or a function that returns cluster ids. 
    // For the 2D array option, the index of the array indicates the cluster ID for all elements in 
    // the collection at that index. Unclustered nodes must NOT be present in this array of clusters.
    // 
    // For the function, it would be given a Cytoscape node and it is expected to return a cluster id  
    // corresponding to that node. Returning negative numbers, null or undefined is fine for unclustered
    // nodes.  
    // e.g
    // Array:                                     OR          function(node){
    //  [ ['n1','n2','n3'],                                       ...
    //    ['n5','n6']                                         }
    //    ['n7', 'n8', 'n9', 'n10'] ]                         
    clusters: clusterInfo,
    
    // -------- Optional parameters --------
    // Whether to animate the layout
    // - true : Animate while the layout is running
    // - false : Just show the end result
    // - 'end' : Animate directly to the end result
    animate: false,
    
    // number of ticks per frame; higher is faster but more jerky
    refresh: 10, 
    
    // Animation duration used for animate:'end'
    animationDuration: undefined,
    
    // Easing for animate:'end'
    animationEasing: undefined,
    
    // Whether to fit the viewport to the repositioned graph
    // true : Fits at end of layout for animate:false or animate:'end'
    fit: true,
    
    // Padding in rendered co-ordinates around the layout
    padding: 30,
    
    // separation amount between nodes in a cluster
    // note: increasing this amount will also increase the simulation time 
    nodeSeparation: 12.5,
    
    // Inter-cluster edge length factor 
    // (2.0 means inter-cluster edges should be twice as long as intra-cluster edges)
    idealInterClusterEdgeLengthCoefficient: 1.4,

    // Whether to pull on-circle nodes inside of the circle
    allowNodesInsideCircle: false,
    
    // Max percentage of the nodes in a circle that can move inside the circle
    maxRatioOfNodesInsideCircle: 0.1,
    
    // - Lower values give looser springs
    // - Higher values give tighter springs
    springCoeff: 0.45,
    
    // Node repulsion (non overlapping) multiplier
    nodeRepulsion: 4500,
    
    // Gravity force (constant)
    gravity: 0.25,
    
    // Gravity range (constant)
    gravityRange: 3.8, 

    // Layout event callbacks; equivalent to `layout.one('layoutready', callback)` for example
    ready: function(){}, // on layoutready
    stop: function(){}, // on layoutstop
}
```

## Build targets

* `npm run test` : Run Mocha tests in `./test`
* `npm run build` : Build `./src/**` into `cytoscape-cise.js`
* `npm run watch` : Automatically build on changes with live reloading (N.b. you must already have an HTTP server running)
* `npm run dev` : Automatically build on changes with live reloading with webpack dev server
* `npm run lint` : Run eslint on the source

N.b. all builds use babel, so modern ES features can be used in the `src`.


## Publishing instructions

This project is set up to automatically be published to npm and bower.  To publish:

1. Build the extension : `npm run build:release`
1. Commit the build : `git commit -am "Build for release"`
1. Bump the version number and tag: `npm version major|minor|patch`
1. Push to origin: `git push && git push --tags`
1. Publish to npm: `npm publish .`
1. If publishing to bower for the first time, you'll need to run `bower register cytoscape-cise https://github.com/iVis-at-Bilkent/cytoscape.js-cise.git`
1. [Make a new release](https://github.com/iVis-at-Bilkent/cytoscape.js-cise/releases/new) for Zenodo.

## Team

  * [Alihan Okka](https://github.com/alihanokka) and [Ugur Dogrusoz](https://github.com/ugurdogrusoz) of [i-Vis at Bilkent University](http://www.cs.bilkent.edu.tr/~ivis)
