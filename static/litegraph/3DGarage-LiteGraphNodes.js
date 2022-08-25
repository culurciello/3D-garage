// 3d garage misc litegraph nodes


// vector 3d constant
function Constant3D(v)
{
    this.v = v;
    this.title = "Constant3D";
    this.addOutput("distance", "vec3");
}

Constant3D.prototype.onExecute = function()
{
    if (this.v) 
        this.setOutputData(0, this.v);
}

// Constant3D.setValue = function(v) {
//     this.v = v;
// }

LiteGraph.registerNodeType("3dgarage/constant_3d", Constant3D);



// 3d distance
function Distance3D()
{
    this.title = "Distance 3D";
    this.addInput("V1", "vec3");
    this.addInput("V2", "vec3");
    this.addOutput("distance", "number");
}

Distance3D.prototype.onExecute = function()
{
    var v1 = this.getInputData(0);
    if( v1 === undefined ) v1 = new BABYLON.Vector3(0,0,0);
    var v2 = this.getInputData(1);
    if( v2 === undefined ) v2 = new BABYLON.Vector3(0,0,0);
    var distance = BABYLON.Vector3.Distance(v1,v2);
    this.setOutputData(0, distance);
}

LiteGraph.registerNodeType("3dgarage/distance_3d", Distance3D);


