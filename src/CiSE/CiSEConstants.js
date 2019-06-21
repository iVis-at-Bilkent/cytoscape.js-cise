/**
 * This class maintains the constants used by CiSE layout.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */


let FDLayoutConstants =  require('avsdf-base').layoutBase.FDLayoutConstants;

function CiSEConstants(){}

for( let prop in FDLayoutConstants)
{
    CiSEConstants[prop] = FDLayoutConstants[prop];
}

// -----------------------------------------------------------------------------
// Section: CiSE layout user options
// -----------------------------------------------------------------------------

CiSEConstants.DEFAULT_SPRING_STRENGTH = 1.5 * FDLayoutConstants.DEFAULT_SPRING_STRENGTH;

// Amount of separation of nodes on the associated circle
CiSEConstants.DEFAULT_NODE_SEPARATION = FDLayoutConstants.DEFAULT_EDGE_LENGTH / 4;

// Inter-cluster edge length factor (2.0 means inter-cluster edges should be
// twice as long as intra-cluster edges)
CiSEConstants.DEFAULT_IDEAL_INTER_CLUSTER_EDGE_LENGTH_COEFF = 1.4;

// Whether to enable pulling nodes inside of the circles
CiSEConstants.DEFAULT_ALLOW_NODES_INSIDE_CIRCLE = false;

// Max percentage of the nodes in a circle that can be inside the circle
CiSEConstants.DEFAULT_MAX_RATIO_OF_NODES_INSIDE_CIRCLE = 0.1;

// -----------------------------------------------------------------------------
// Section: CiSE layout remaining constants
// -----------------------------------------------------------------------------

// Ideal length of an edge incident with an inner-node
CiSEConstants.DEFAULT_INNER_EDGE_LENGTH = FDLayoutConstants.DEFAULT_EDGE_LENGTH / 3;

// Maximum rotation angle
CiSEConstants.MAX_ROTATION_ANGLE = Math.PI / 36.0;

// Minimum rotation angle
CiSEConstants.MIN_ROTATION_ANGLE = -CiSEConstants.MAX_ROTATION_ANGLE;

// Number of iterations without swap or swap prepartion
CiSEConstants.SWAP_IDLE_DURATION = 45;

// Number of iterations required for collecting information about swapping
CiSEConstants.SWAP_PREPERATION_DURATION = 5;

// Number of iterations that should be done in between two swaps.
CiSEConstants.SWAP_PERIOD =
    CiSEConstants.SWAP_IDLE_DURATION + CiSEConstants.SWAP_PREPERATION_DURATION;

// Number of iterations during which history (of pairs swapped) kept
CiSEConstants.SWAP_HISTORY_CLEARANCE_PERIOD = 6 * CiSEConstants.SWAP_PERIOD;

// Buffer for swapping
CiSEConstants.MIN_DISPLACEMENT_FOR_SWAP = 6;

// Number of iterations that should be done in between two flips.
CiSEConstants.REVERSE_PERIOD = 25;

module.exports = CiSEConstants;
