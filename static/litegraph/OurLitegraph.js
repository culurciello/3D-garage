import './3DGarage-LiteGraphNodes.js';

// note for global var referring from: "GAME.currentLevel."

// // my input variable:
// function MyVarIn(obj)
// {
//     this.myobj = obj[0]; // player.mesh.position
//     this.mypro = obj[1]; // y
//     this.title = obj[0] +'.'+  obj[1];
//     this.myvar = eval("GAME.currentLevel."+this.title);
//     this.addOutput("Out","number");
// }

// MyVarIn.prototype.onExecute = function()
// {
//   this.setOutputData( 0, this.myvar );
// }

// LiteGraph.registerNodeType("3dgarage/my_var_in", MyVarIn);


// // my output variable:
// function MyVarOut(obj)
// {
//     this.myobj = obj[0]; // player.mesh.position
//     this.mypro = obj[1]; // y
//     this.title = obj[0] +'.'+  obj[1];
//     this.addInput("In","number");
// }

// MyVarOut.prototype.onExecute = function()
// {
//     // console.log( eval("GAME.currentLevel."+this.myobj)[this.mypro] )
//     // eval("GAME.currentLevel."+this.myobj)[this.mypro] = this.getInputData(0);
// }

// LiteGraph.registerNodeType("3dgarage/my_var_out", MyVarOut);


export default class OurLitegraph {

    constructor(level) {
        this.level = level;
        this.results = null;
        console.log('litegraph created')
    }

    run() {
        this.graph = new LGraph();

        var canvas = new LGraphCanvas("#litegraph", this.graph);

        var node_var_in = LiteGraph.createNode("3dgarage/player_pos_in");
        node_var_in.pos = [30,100];
        this.graph.add(node_var_in);

        // var node_const = LiteGraph.createNode("3dgarage/constant_3d", new BABYLON.Vector3(9,1,10));
        // node_const.pos = [100,200];
        // this.graph.add(node_const);

        console.log(GAME.currentLevel.blocks)
        var node_const = LiteGraph.createNode("3dgarage/block_pos_in", GAME.currentLevel.blocks[0]);
        node_const.pos = [100,200];
        this.graph.add(node_const);

        var node_op = LiteGraph.createNode("3dgarage/distance_3d");
        node_op.pos = [400,100];
        this.graph.add(node_op);

        var node_watch = LiteGraph.createNode("basic/watch");
        node_watch.pos = [600,100];
        this.graph.add(node_watch);
        
        var node_constd = LiteGraph.createNode("basic/const");
        node_constd.pos = [350,250];
        node_constd.setValue(2.0);
        this.graph.add(node_constd);

        var node_comp = LiteGraph.createNode("math/condition");
        node_comp.pos = [600,200];
        this.graph.add(node_comp);

        var node_starta = LiteGraph.createNode("3dgarage/block_start_anim", GAME.currentLevel.blocks[0]);
        node_starta.pos = [800,300];
        this.graph.add(node_starta);

        var node_stopa = LiteGraph.createNode("3dgarage/block_stop_anim", GAME.currentLevel.blocks[0]);
        node_stopa.pos = [800,200];
        this.graph.add(node_stopa);

        // var node_var_out = LiteGraph.createNode("3dgarage/player_pos_out");
        // node_var_out.pos = [600,200];
        // this.graph.add(node_var_out);

        node_var_in.connect(0, node_op, 0);
        node_const.connect(0, node_op, 1);
        node_op.connect(0, node_watch, 0);
        node_op.connect(0, node_comp, 0);
        node_constd.connect(0, node_comp, 1);
        node_comp.connect(1, node_starta, 0);
        node_comp.connect(0, node_stopa, 0);

        // this.save(); // save graph
        this.graph.start();

        // console.log('input mesh pos y:', node_var_in.getOutputData(0));
        // console.log('new mesh pos y:', node_op.getOutputData(0));
        // console.log('new mesh pos y:', node_var_out.getInputData(0));
        console.log('A>B:', node_comp.getOutputData(0));
        console.log('!A>B:', node_comp.getOutputData(1));

    }

    save() {
        var jsonData = this.graph.serialize();
        var fs = require('fs');
        fs.writeFile("litegraph_graph_test.json", jsonData, function(err) {
            if (err) {
                console.log(err);
            }
        });
    }

    save() {

        var data = JSON.stringify(this.graph.serialize());
        var file = new Blob([data]);
        var url = URL.createObjectURL(file);
        var element = document.createElement("a");
        element.setAttribute('href', url);
        element.setAttribute('download', "untitled.tcgraph");
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000 * 60); 

    }

    load() {

        if (typeof FileReader === 'undefined') {
            console.log('File loading not supported by your browser');
            return;
        }

        var inputElement = document.createElement('input');

        inputElement.type = 'file';
        inputElement.accept = '.tcgraph';
        inputElement.multiple = false;

        inputElement.addEventListener('change', function (data) {

            if (inputElement.files) {

                var file = inputElement.files[0];
                var reader = new FileReader();

                reader.addEventListener('loadend', function (load_data) {

                    if (reader.result)
                        this.graph.configure(JSON.parse(reader.result));

                });
                reader.addEventListener('error', function (load_data) {
                    console.log('File load error');
                });

                reader.readAsText(file);

            }
        });

        inputElement.click();
        return;

    }



}