import GarageAnimator from './Animator.js';
import '../litegraph/ConstructionBlock-LiteGraphNodes.js';

export default class ConstructionBlock {

    constructor(level, 
                size = new BABYLON.Vector3(1, 1, 1), 
                position = new BABYLON.Vector3(0, 1, 0), 
                rotation = new BABYLON.Vector3(0, 0, 0), 
                color) {

        this.level = level;
        this.scene = level.scene;
        // this.actionManager = new BABYLON.ActionManager(this.scene);
        // this.advancedTexture = level.advancedTexture;

        this.parent = this.level.ground; // parenting to level ground by default
        this.mesh = null;
        this.size = size;
        this.position = position;
        this.rotation = rotation;
        this.color = color;

        this.destructible = false; // can be destroyed 
        this.destructive = false; // can destroy
        // this.visible ==> this.mesh.isVisible
        // this.solid ==> this.mesh.chechCollision and isPickable
        this.movable = false;

        // editable properties (used by graphical programming nodes):
        this.editableProperties = [this.destructible, this.destructive, this.visible, this.movable,
                                   this.solid, this.size, this.position, this.color,
                                  ];

        this.states = {
            'CLOSE_TO_PLAYER': false,
            'IN_ANIMATION': false,
        };

        // graphical nodes:
        this.graphicalPorts = null; // graphical node ports 
    }

    create() {
        this.mesh = new BABYLON.Mesh.CreateBox('block', 2, this.level.scene);
        this.mesh.block = this;
        this.mesh.scaling = this.size;
        this.mesh.position = this.position;
        // this.mesh.rotation = this.rotation; // am not able to apply rotation here... not sure why
        // this.mesh.ellipsoid = this.size;
        this.mesh.setEnabled(true);
        this.mesh.isPickable = true;
        this.mesh.checkCollisions = true;

        var boxMaterial = new BABYLON.StandardMaterial('blockmat', this.level.scene);
        if (this.color) boxMaterial.emissiveColor = this.color;
        else { 
            boxMaterial.emissiveColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        }
        this.mesh.material = boxMaterial;
        this.color = this.mesh.material.emissiveColor; // update object color

        BABYLON.Tags.AddTagsTo(this.mesh, 'block');

        this._miniMenu = this.level.ui.miniMenu(this);
        this._editMenu = this.level.ui.editMenu(this);

        // animations:
        this.animator = new GarageAnimator(this);
        
        // initialize graphical interface and nodes
        this.graphicalPortsInit();

        // events:
        // this works, jsut not used!
        // this.mesh.actionManager = new BABYLON.ActionManager(this.scene);
        // this.mesh.actionManager.registerAction(
        //     new BABYLON.ExecuteCodeAction(
        //         {
        //         trigger:BABYLON.ActionManager.OnIntersectionEnterTrigger,
        //         parameter:this.scene.getMeshByName("Ch46"), // Ch46 is player
        //         }, 
        //         function(){
        //             // this.states["CLOSE_TO_PLAYER"] = true;
        //             console.log('block: close to player!');
        //         }
        //     )
        // );


        // actions to run before each update:
        this.scene.registerBeforeRender(() => {
            this._beforeRenderUpdate();
        })


        return this;
    }

    destroy() {
        console.log('destroyed!')
        if (this._miniMenu) this.level.ui.menuTexture.removeControl(this._miniMenu);
        if (this._editMenu) this.level.ui.menuTexture.removeControl(this._editMenu);
        this.level.interpolate(this.mesh.position, 'y', 0.5, 100 * this.mesh.position.y);
        this.remove();
    }

    remove() {
        if(!this.mesh) return;
        
        setTimeout(() => {
            this.mesh.dispose();
            this.mesh = null;
        }, 300);
    }


    /* ACTIONS */

    _runChecksActions() {

        // run for each action: if cond1 [and/or cond2] then do xyz:

        // calculate distances:
        // // if (GAME.currentLevel.player) // should check for player before running a action on it!
        // var distance_player  = BABYLON.Vector3.Distance(this.mesh.position, GAME.currentLevel.player.mesh.position);
        // // console.log('block to player dist:', distance_player);
        
        // // ACTION1: if player is close, then raise to height 3:
        // if (distance_player < 2.0) {
        //     this.animator.startAnimation("BOUNCE_UP");
        // } else {
        //     this.animator.stopAnimation("BOUNCE_UP");
        // }

    }


    /*
    GRAPHICAL NODES:

    - graphicalPorts are connections between nodes:
        - moveWith: position this node = position nodeFrom + offset
    - connection = {nodeFrom, port}
    */

    graphicalPortsInit() {
        // graphical ports:
        this.graphicalPorts = {};
        this.graphicalPorts.moveWith = null;
        // console.log(this.graphicalPorts)
    }

    graphicalPortsUpdate(change) {
        // console.log(change)
        // should be a switch on all graphical ports:
        if (change.port == 'moveWith'){
            this.graphicalPorts.moveWith = change.nodeFrom;
            var transformNode = new BABYLON.TransformNode('blockTransformNode');
            transformNode.parent = this.graphicalPorts.moveWith.mesh; 
            transformNode.position = new BABYLON.Vector3(0.6,0,1);
            this.mesh.parent = transformNode;
        }
    }

        //--GAME UPDATES--
    _beforeRenderUpdate() {
        this._runChecksActions();
    }

     
} // end class