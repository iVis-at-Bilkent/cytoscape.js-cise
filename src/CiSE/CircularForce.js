/**
 * This class is a utility class that is used to store the rotation amount,
 * x-axis displacement and y-axis displacement components of a force that act
 * upon an on-circle node. The calculation for this is done in CiSECircle for
 * specified on-circle node. Here we assume that forces on on-circle nodes can
 * be modelled with forces acting upon the perimeter of a circular flat, rigid
 * object sitting on a 2-dimensional surface, free to move in a direction
 * without any friction. Thus, such an object is assumed to move and rotate on
 * this force in amounts proportional to the total force (not just the vertical
 * component of the force!) and the component of the force that is tangential to
 * the circular shape of the object, respectively.
 *
 *
 * Copyright: i-Vis Research Group, Bilkent University, 2007 - present
 */

// -----------------------------------------------------------------------------
// Section: Constructors and initializations
// -----------------------------------------------------------------------------

function CircularForce(rotationAmount, displacementX, displacementY)
{
    // This is the rotation amount that is to be assigned to the rotationAmount
    // of a CiSENode
    this.rotationAmount = rotationAmount;

    // This is the x-axis displacement value that is to be assigned to the displacementX
    // of a CiSENode
    this.displacementX = displacementX;

    // This is the y-axis displacement value that is to be assigned to the displacementY
    // of a CiSENode
    this.displacementY = displacementY;
}

// -----------------------------------------------------------------------------
// Section: Accessors and mutators
// -----------------------------------------------------------------------------

CircularForce.prototype.getRotationAmount = function()
{
    return this.rotationAmount;
};

CircularForce.prototype.setRotationAmount = function(rotationAmount)
{
    this.rotationAmount = rotationAmount;
};

CircularForce.prototype.getDisplacementX = function()
{
    return this.displacementX;
};

CircularForce.prototype.setDisplacementX = function(displacementX)
{
    this.displacementX = displacementX;
};

CircularForce.prototype.getDisplacementY = function()
{
    return this.displacementY;
};

CircularForce.prototype.setDisplacementY = function(displacementY)
{
    this.displacementY = displacementY;
};

module.exports = CircularForce;