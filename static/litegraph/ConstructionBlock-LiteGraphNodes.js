
// construction blockslitegraph nodes:


// block pos in 
function blockPosIn(block)
{
    this.block = block;
    this.title = "block "+block.name+" position in";
    this.addOutput("Out", "vec3");
}

blockPosIn.prototype.onExecute = function()
{
    if (this.block) this.setOutputData(0, this.block.mesh.position);
}

LiteGraph.registerNodeType("3dgarage/block_pos_in", blockPosIn);


// block pos output
function blockPosOut(block)
{
    this.block = block;
    this.title = "block "+block.name+" position out";
    this.addInput("In", "vec3");
}

blockPosOut.prototype.onExecute = function()
{
    var vout = this.getInputData(0)
    if (vout === undefined) vout = new BABYLON.Vector3(0,0,0);
    if (this.block) this.block.mesh.position = vout;
}

LiteGraph.registerNodeType("3dgarage/block_pos_out", blockPosOut);


// start animation
function startAnim(block)
{
    this.block = block;
    this.anim = "BOUNCE_UP";
    this.title = "start animation block "+block.name;
    this.addInput("start", "boolean");
}

startAnim.prototype.onExecute = function()
{
    if (this.block && this.getInputData(0)) 
        this.block.animator.startAnimation(this.anim);
}

LiteGraph.registerNodeType("3dgarage/block_start_anim", startAnim);


// stop animation
function stopAnim(block)
{
    this.block = block;
    this.anim = "BOUNCE_UP";
    this.title = "stop animation block "+block.name;
    this.addInput("stop", "boolean");
}

stopAnim.prototype.onExecute = function()
{
    if (this.block && this.getInputData(0)) 
        this.block.animator.stopAnimation(this.anim);
}

LiteGraph.registerNodeType("3dgarage/block_stop_anim", stopAnim);