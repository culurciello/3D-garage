import UI from '../../base/UI.js';
import ConstructionBlock from '../ConstructionBlock.js';
import HouseBuilder from '../HouseBuilder.js';
import RandoObj from '../randoObj.js';
import Level from '../../base/Level.js';
import Player from '../Player.js';
import TLCamera from '../Camera.js';

import OurLitegraph from '../../litegraph/OurLitegraph.js'

export default class FirstLevel extends Level {

    setProperties() {
        // level menu and vars:
        this.menu = null;
        this.selectedObject = null; // object selected by user to edit / visual code
        this.editMode = false; // false == game, true == edit

        // level elements:
        this.player = null;
        this.blocks = []; // list of blocks used
        this.lenBlocks = 0; // how many blocks used
    }

    setupAssets() {

        // player:
        // this.assets.addAnimatedMesh('player', './static/assets/models/boy/boy.glb', {
        //     'normalized': true, // Normalize all animations
        //     'start': 0,
        //     'end': 40
        // });
        this.assets.addAnimatedMesh('player', './static/assets/models/amy/amy.glb', {
            'normalized': true, // Normalize all animations
            'start': 0,
            'end': 40
        });
        // this.assets.addMesh('player', './static/assets/models/boy/boy.glb');
        // this.assets.addMesh('player', './static/assets/models/amy/amy.glb');

        // list of random objects:
        this.randoObjList = ["train", "car", "plane", "ball", "chair"]; // asset list
        this.randoObjListSizes = [1, 20, 50, 100, 0.05]; // asset list import resize

        this.assets.addMesh('train', './static/assets/models/train/train.obj');
        this.assets.addMesh('car', './static/assets/models/car/car.glb');
        this.assets.addMergedMesh('chair', './static/assets/models/chair/chair.obj');
        this.assets.addMesh('plane', './static/assets/models/plane/plane.glb');
        this.assets.addMesh('ball', './static/assets/models/ball/ball.glb');

        // sounds and music:
        // this.assets.addMusic('music', './static/assets/musics/music.mp3', {volume: 0.1});
        // this.assets.addSound('empty', './static/assets/sounds/empty.wav', { volume: 0.4 });
        
    }

    buildScene() {
        
        this.scene.clearColor = new BABYLON.Color3.FromHexString('#777');
        
        // Adding lights
        var dirLight = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, -1, 0), this.scene);
        dirLight.intensity = 0.5;

        let hemiLight = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(-1, 1, 0), this.scene);
        hemiLight.intensity = 0.5;
        // hemiLight.diffuse = new BABYLON.Color3(1, 0, 0);
        // hemiLight.specular = new BABYLON.Color3(0, 1, 0);
        // hemiLight.groundColor = new BABYLON.Color3(0, 1, 0);
    
        // Sky material
        var skyboxMaterial = new BABYLON.SkyMaterial("skyMaterial", this.scene);
        skyboxMaterial.backFaceCulling = false;
        //skyboxMaterial._cachedDefines.FOG = true;

        // Sky mesh (box)
        var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, this.scene);
        skybox.material = skyboxMaterial;
        skyboxMaterial.inclination = 0;
        skyboxMaterial.luminance = 0.5;

        // physics:
        // var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
        // this.scene.enablePhysics(gravityVector, new BABYLON.OimoJSPlugin());
        // this.scene.enablePhysics();
        this.scene.collisionsEnabled = true;

        // Create and set the active camera
        this.cam = new TLCamera(this).create();
        this.scene.activeCamera = this.cam.camera;
        // this.enablePointerLock();

        // debug Inspector:
        // this.scene.debugLayer.show({
        //     embedMode: true,
        // });
        
        // User Interface:
        this.createMenu();
        this.highlight = new BABYLON.HighlightLayer("hl1", this.scene);
        this.setEditGizmo();

        // house room builder:
        this.houseBuilder = new HouseBuilder(this);

        // start game objects:
        this.levelStart();

        this.setupEventListeners();

        // litegraph
        this.litegraph = new OurLitegraph(this);
        // this.litegraph.run();
    }

    setEditGizmo(){
        // edit gizmo
        this.gizmoManager = new BABYLON.GizmoManager(this.scene)
        // this.gizmoManager.boundingBoxGizmoEnabled=true
        // this.gizmoManager.usePointerToAttachGizmos = true;
        this.gizmoManager.sensitivity = 1
        this.gizmoManager.snapDistance = 0.5
        // Toggle gizmos with keyboard buttons
        document.onkeydown = (e)=>{
            if(e.key == 'f'){
                this.gizmoManager.positionGizmoEnabled = !this.gizmoManager.positionGizmoEnabled
            }
            if(e.key == 'e'){
                this.gizmoManager.rotationGizmoEnabled = !this.gizmoManager.rotationGizmoEnabled
            }
            if(e.key == 'r'){
                this.gizmoManager.scaleGizmoEnabled = !this.gizmoManager.scaleGizmoEnabled
            }
            if(e.key == 't'){
                this.gizmoManager.boundingBoxGizmoEnabled = !this.gizmoManager.boundingBoxGizmoEnabled
            }
        }
    }

    toggleEditMode() {
        // toggle edit / game mode
        this.editMode = !this.editMode;
        if (this.editMode) {
            // this.cam.setCamera2Top(); // edit camera
            // turn on edit mode menus:
            for (const b of this.blocks){
                b._miniMenu.isVisible = true;
                // visualize with wireframe (edit) if not visible:
                // if (!b.mesh.isVisible) {
                //     b.mesh.isVisible = true;
                //     b.mesh.material.wireframe = true;
                // }
            }
            this.blockly.showBlockly();
        }
        else {
            // this.cam.setCamera2FPS(); // game camera 
            // turn off edit mode menus:
            for (const b of this.blocks){
                b._miniMenu.isVisible = false;
                b._editMenu.isVisible = false;
                // remove wireframe (no edit) if not visible:
                // if (!b.mesh.isVisible & b.mesh.material.wireframe) {
                //     b.mesh.isVisible = false;
                //     b.mesh.material.wireframe = false;
                // }
            }
            this.blockly.hideBlockly();
        }
    }

    levelStart() {
        // start level objects:
        this.createGround();
        this.addPlayer();
        // this.addTestBlocks(); // test blocks to test level
    }

    createGround() {
        this.ground = BABYLON.Mesh.CreateGround('ground', 500, 500, 2, this.scene);
        this.ground.isPickable = true;
        // this.ground.checkCollisions = true; //dont check for collisions, dont allow for raycasting to detect it(cant land on it)
        
        var groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture('./static/assets/images/tile.jpg', this.scene);
        groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        groundMaterial.diffuseTexture.uScale = 100.0; // tiling
        groundMaterial.diffuseTexture.vScale = 100.0; // tiling
        groundMaterial.diffuseTexture.uOffset = 0.5; // offset
        groundMaterial.diffuseTexture.vOffset = 0.5; // offset

        this.ground.material = groundMaterial;
    }

    addPlayer() {
        this.player = new Player(this);
        this.player.create();
    }

    addTestBlocks() {
        // var b1 = this.addBlock();
        var rotation = new BABYLON.Vector3(0,0,0);
        var b1 = this.addBlock(new BABYLON.Vector3(2, 2, 5), new BABYLON.Vector3(10, 2, 0), rotation, null);
        var b2 = this.addBlock(new BABYLON.Vector3(-10, 1, 0));
        var b3 = this.addBlock(new BABYLON.Vector3(6, 0.2, 2), new BABYLON.Vector3(-3, 2, 0), rotation, null);
        var b31 = this.addBlock(new BABYLON.Vector3(6, 0.2, 2), new BABYLON.Vector3(-3, 1, 4), rotation, null);
        b3.movable = false;

        // graphical nodes test:
        // moveWith -- adda  block that moves with another!
        var b4 = this.addBlock(new BABYLON.Vector3(0.05, 0.05, 0.2), new BABYLON.Vector3(-0.4, 0.5, -0.7), rotation, null);
        b4.graphicalPortsUpdate({nodeFrom: this.player, port: 'moveWith'}); // connect b4 to player (weapon?!)
    }

    addBlock(size, position, rotation, color){
        var b = new ConstructionBlock(this, size, position, rotation, color).create();
        b.name = "block_" + this.lenBlocks;
        this.blocks.push(b);
        this.lenBlocks++;
        this.selectedObject = b;
        return b;
    }

    // example of adding a random mesh as construction block
    addObj(meshName) {
        var s = this.randoObjListSizes[this.randoObjList.indexOf(meshName)];
        // console.log('mesh size', s)
        var size = new BABYLON.Vector3(s,s,s);
        var position = new BABYLON.Vector3(9, 0, 5);
        var rotation = new BABYLON.Vector3(0, -Math.PI/4, 0);
        // var color = new BABYLON.Color3(0.4, 0.2, 0.1);
        var m = new RandoObj(this, size, position, rotation, null).create(meshName);
        m.name = meshName;
        return m;
    }

    addRoom() {
        this.house = this.houseBuilder.create();
    }


    // test some scripted animations here
    animateTestScene() {
        // player goes to a block and have block raise in air

        // movie cam:
        this.cam.detachFromPlayer(); // movie mode - do not follow player

        // block:
        var block_pos = new BABYLON.Vector3(9, 1, 10);
        var b1 = this.addBlock(new BABYLON.Vector3(1, 1, 1), block_pos);
        
        // 1- move player to box:
        // this.player.startScriptedAnimation({"action":"move", "pos":block_pos});
        this.player.animator.addAnimation({type: "move", pos: block_pos});

        // 2- box jumps up once player is close - set in object ACTIONS
        b1.animator.addAnimation({type: "action", name: "BOUNCE_UP"});

        // now run litegraph:
        this.litegraph.run();

    }

    setupEventListeners() {
        // mouse clicks:
        this.scene.onPointerObservable.add((eventData) => {
            if (eventData.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                // console.log('start X,Y: ', this.scene.pointerX, this.scene.pointerY)
                const result = this.scene.pick(this.scene.pointerX, this.scene.pointerY)
                if (result.hit) {
                    var n = result.pickedMesh.name;
                    if (this.selectedObject != null) { 
                        this.highlight.removeMesh(this.selectedObject);
                        this.selectedObject.selected = false;
                    }
                    // do not pick on ground or sky - use them to unselect!
                    if (!(n=='ground' || n=='skyBox')) {
                        this.highlight.addMesh(result.pickedMesh, BABYLON.Color3.White())
                        result.pickedMesh.selected = true;
                        this.selectedObject = result.pickedMesh;
                        console.log('Selected:', n)
                    }
                }
            } 
        })
    }

    reStart() {
    
        // clean up previous scene:
        console.log("restarting");
        this.blockly = null;
        GAME.engine.stopRenderLoop();
        this.scene.dispose();

        // and re-start:
        GAME.startLevel();
    }

    createMenu() {
        this.ui = new UI('testLevelUI');

        // restart:
        this.ui.addButton('backButton', 'Restart', {
            'top': '-45%',
            'left':'-40%',
            'onclick': () => this.reStart()
        });

        // Edit / Game:
        this.ui.addButton('editgameButton', 'Edit/Game', {
            'top': '-45%',
            'left':'-30%',
            'onclick': () => this.toggleEditMode()
        });

        // add items:
        this.ui.addButton('addBlockButton', 'Add Block', {
            'top': '-35%',
            'left':'-40%',
            'onclick': () => this.addBlock()
        });

        // add items:
        this.ui.addButton('addBlockButton', 'Add Object', {
            'top': '-25%',
            'left':'-40%',
            'onclick': () => this.ui.addObjSelector(this, this.randoObjList)
        });
        
        // add room
        this.ui.addButton('addBlockButton', 'Add Room', {
            'top': '-15%',
            'left':'-40%',
            'onclick': () => this.addRoom()
        });

        // save scene
        this.ui.addButton('savesButton', 'Save Scene', {
            'top': '-45%',
            'left':'40%',
            'onclick': () => this.saveScene()
        });

        // load scene
        this.ui.addButton('loadsButton', 'Load Scene', {
            'top': '-35%',
            'left':'40%',
            'onclick': () => this.loadScene()
        });


        // test animation
        this.ui.addButton('tanimButton', 'Test Anim', {
            'top': '-25%',
            'left':'40%',
            'onclick': () => this.animateTestScene()
        });

        // add edit instructions:
        this.ui.addText('Edit Keys: select object with mouse, then: "t", "r": resize, "f": move, "e": rotate', {
            'top': '95%',
            'left':'-10%',
            'fontSize': '18'
        });

    }

    beforeRender() {
        if(!GAME.isPaused()) {
            if(this.cam.camera.position.y < -30) {
                console.log('Game over!')
                // this.gameOver();
            }
        }
    }

    // custom save function  - not BabylonJS default json save scene!
    saveScene() {
        // console.log('save scene - custom');
        var data = []

        // save construction blocks
        this.blocks.forEach( (block) => {
            var block_data = {"type":"ConstructionBlock", 
                              "name":block.name, 
                              "size":block.mesh.scaling,
                              "position":block.mesh.position,
                              "rotation":block.mesh.rotation, 
                              "color":block.mesh.material.emissiveColor};
            data.push(block_data);
            // console.log('block:', block, data);
        });

        // save visual programming
        // TBD

        // save to file via web interface:
        var json = JSON.stringify(data);
        var blob = new Blob([json], {type: "application/json"});
        var url  = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.download    = "backup.json";
        a.href        = url;
        a.textContent = "Download backup.json";
        a.click();

    }

    // custom load function  - not BabylonJS default json save scene!
    loadScene() {

        console.log("Loading saved scene");
        this.reStart();

        this.scene.executeWhenReady(function () {

            // load saved data:
            // cannot make dialog get full path, so have to save in a pre-defined location:
            fetch('./static/assets/save/backup.json')
                .then(response => response.json())
                .then(data => {
                    console.log('fetched:', data);
                    data.forEach( (block) => {
                        if (block["type"] == "ConstructionBlock") {
                            console.log('loaded block:', block);
                            var position = block["position"];
                            var rotation = block["rotation"];
                            var size = new BABYLON.Vector3(block["size"]["_x"], block["size"]["_y"], block["size"]["_z"]);
                            var color = block["color"];
                            // console.log(size, position, rotation, color)
                            var b = GAME.currentLevel.addBlock(size, position, rotation, color);
                            b.name = block["name"]
                        };
                    });
                });


            // // load file via dialog:
            // var fileInput = document.getElementById("loadFile");

            // if(!fileInput){
            //     fileInput = document.createElement("INPUT");
            //     fileInput.setAttribute("id", "loadFile");
            //     fileInput.setAttribute("type", "file");
            //     fileInput.style.position = "absolute";
            //     fileInput.style.top = "80px";
            //     fileInput.style.width = "200px"
            //     fileInput.style.height = "100px";
            //     fileInput.style.right = "40px"
            //     document.body.children[0].appendChild(fileInput);
            // }

            // var loadButton = document.getElementById('loadFile');

            // loadButton.onchange = function(evt){
            //     var files = evt.target.files;
            //     var filename = files[0].name;
            //     // var blob = new Blob([files[0]]);

            //     console.log(files[0], filename)

            //     fetch(filename)//'./static/assets/save/scene.json')
            //         .then(response => response.json())
            //         .then(data => {
            //             console.log('fetched:', data);
            //             var sceneString = "data:" + JSON.stringify(data);
            //             });
            // };
            // loadButton.click(); // opening dialog
        });
    }

}