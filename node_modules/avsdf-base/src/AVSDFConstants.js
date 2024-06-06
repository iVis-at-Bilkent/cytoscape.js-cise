var LayoutConstants = require('layout-base').LayoutConstants;

function AVSDFConstants(){}

// AVSDFConstants inherits properties in LayoutConstants
for(var prop in LayoutConstants){
    AVSDFConstants[prop] = LayoutConstants[prop];
}

AVSDFConstants.DEFAULT_NODE_SEPARATION = 60;

module.exports = AVSDFConstants;