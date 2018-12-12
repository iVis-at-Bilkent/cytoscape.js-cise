// -----------------------------------------------------------------------------
// Section: Constructors and initializations
// -----------------------------------------------------------------------------

function CircularForce(rotationAmount, displacementX, displacementY)
{
    // TODO this check may be redundant
    if( rotationAmount !== undefined && displacementX !== undefined && displacementY !== undefined )
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
}

CircularForce.prototype = Object.create(null);

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