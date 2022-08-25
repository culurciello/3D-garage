

// player litegraph nodes:


// my input variable:
function playerPosIn()
{
    this.player = GAME.currentLevel.player;
    this.title = "player position in";
    this.addOutput("Out", "vec3");
}

playerPosIn.prototype.onExecute = function()
{
    if (this.player) this.setOutputData(0, this.player.mesh.position);
}

LiteGraph.registerNodeType("3dgarage/player_pos_in", playerPosIn);


// my output variable:
function playerPosOut()
{
    this.title = "player position out";
    this.addInput("In", "vec3");
}

playerPosOut.prototype.onExecute = function()
{
    var vout = this.getInputData(0)
    if (vout === undefined) vout = new BABYLON.Vector3(0,0,0);
    if (this.player) this.player.mesh.position = vout;
}

LiteGraph.registerNodeType("3dgarage/player_pos_out", playerPosOut);