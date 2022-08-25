// player controller from:
// https://github.com/BabylonJS/SummerFestival/tree/82eefc28fd34169860ea8e3f4a9e3b0c6c83935b

import ConstructionBlock from './ConstructionBlock.js';
import { PlayerInput } from './inputController.js';
import GarageAnimator from './Animator.js';
import '../litegraph/Player-LiteGraphNodes.js';

export default class Player extends ConstructionBlock {

    create() {

        // SIMPLE MESH
        // this.mesh = new BABYLON.Mesh.CreateSphere('player', 32, 1, this.scene);
        // this.mesh.scaling.x = 1;//this.size.x;
        // this.mesh.scaling.y = 3;//this.size.y;
        // this.mesh.scaling.z = 1;//this.size.z;
        // this.mesh.position =  new BABYLON.Vector3(0, 3, 10);
        // this.mesh.rotationQuaternion = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 0, 0), 0);
        // var boxMaterial = new BABYLON.StandardMaterial('playerMat', this.scene);
        // boxMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.2, 0.2);
        // this.mesh.material = boxMaterial;
        // this.color = this.mesh.material.emissiveColor;

        // Amy mesh:
        // mesh gets name "Ch46" for Amy
        this.mesh = this.level.assets.getAnimatedMesh('player');
        this.mesh.scaling = new BABYLON.Vector3(3, 3, 3);
        this.mesh.position =  new BABYLON.Vector3(0, 0.1, 10);

        this.mesh.setEnabled(true);
        this.mesh.isPickable = false;
        this.mesh.checkCollisions = true;
        this.mesh.player = this;
        this.mesh.id = "player";
        this.mesh.name = "player";

        // constants
        this.PLAYER_SPEED = 0.45;
        this.JUMP_FORCE = 0.80;
        this.GRAVITY = -2.8;

        this._input = new PlayerInput(this.scene); //detect keyboard inputs
        this._gravity = new BABYLON.Vector3();
        this._lastGroundPos = new BABYLON.Vector3.Zero();
        this._jumpCount = 1;

        // connect camera to player:
        this.level.cam.attach2Player();

        this.states = {
            'JUMPED': false,
            'FALLING': false,
            'GROUNDED': false,
            'IN_ANIMATION': false, // in a scripted animation sequence
        };

        this._currentAnim = this._idle;
        this._prevAnim = this._idle; 

        this.animations = {
            // Amy animations -  0 = Idle, 1: Jumping, 2: Walking
            'IDLE': this.level.assets.getAnimatedMesh('player').animationGroups[0], //0;
            'JUMP': this.level.assets.getAnimatedMesh('player').animationGroups[1], //1;
            'RUN': this.level.assets.getAnimatedMesh('player').animationGroups[2], //2;
        };
        this._setUpAnimations();

        // animations (pushed from scripting Animator):
        this.animator = new GarageAnimator(this);

        // events:
        // Collisions detection:
        this.mesh.onCollide = function (collidedMesh) {
            console.log('player: collision with:', collidedMesh.id);
            if(collidedMesh.id == 'block') {
                collidedMesh.block.states.CLOSE_TO_PLAYER = true;
                // console.log('collision with block',collidedMesh)
                if (collidedMesh.block.destructible) {
                    collidedMesh.block.destroy(); }

                // if destructive will destroy player:
                if (collidedMesh.block.destructive) {
                    GAME.currentLevel.player.destroy(); }
            }
        }

        BABYLON.Tags.AddTagsTo(this.mesh, 'player');

        // this._miniMenu = this.level.ui.miniMenu(this);
        // this._editMenu = this.level.ui.editMenu(this);
        
        // actions to run before each update:
        this.scene.registerBeforeRender(() => {
            this._beforeRenderUpdate();
            // this._updateCamera();
        })
    
        return this;
    }


    _updateFromControls() {
        this._deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;
        this._moveDirection = BABYLON.Vector3.Zero();
        this._h = this._input.horizontal; //right, x
        this._v = this._input.vertical; //fwd, z

        //clear y so that the character doesnt fly up
        this._moveDirection = new BABYLON.Vector3(this._h, 0, this._v);

        //clamp the input value so that diagonal movement isn't twice as fast
        var inputMag = Math.abs(this._h) + Math.abs(this._v);
        if (inputMag < 0) {
            this._inputAmt = 0;
        } else if (inputMag > 1) {
            this._inputAmt = 1;
        } else {
            this._inputAmt = inputMag;
        }
        //final movement that takes into consideration the inputs
        this._moveDirection = this._moveDirection.scaleInPlace(this._inputAmt * this.PLAYER_SPEED);

        if (!this.states.IN_ANIMATION) {
            //check if there is movement to determine if rotation is needed
            var input = new BABYLON.Vector3(this._input.horizontalAxis, 0, this._input.verticalAxis); //along which axis is the direction
            if (input.length() == 0) {//if there's no input detected, prevent rotation and keep player in same rotation
                return;
            }
            //rotation based on input & the camera angle
            var angle = Math.atan2(this._input.horizontalAxis, this._input.verticalAxis);
        }
        else {
            //rotation based on animation
            var angle = Math.atan2(this._h, this._v);

        }
        // angle += this._camRoot.rotation.y;
        var targ = BABYLON.Quaternion.FromEulerAngles(0, angle, 0);
        this.mesh.rotationQuaternion = BABYLON.Quaternion.Slerp(this.mesh.rotationQuaternion, targ, 10 * this._deltaTime);
    }

    _setUpAnimations() {
        this.scene.stopAllAnimations();
        this.animations.RUN.loopAnimation = true;
        this.animations.IDLE.loopAnimation = true;

        //initialize current and previous
        this._currentAnim = this.animations.IDLE;
        this._prevAnim = this.animations.RUN;
    }

    _animatePlayer() {
        if (!this.states.FALLING && !this.states.JUMPED
            && (this._input.inputMap[this._input.forwardKey] 
            || this._input.inputMap[this._input.backKey]
            || this._input.inputMap[this._input.rightKey]
            || this._input.inputMap[this._input.leftKey]) 
            || this.states.IN_ANIMATION) {

            this._currentAnim = this.animations.RUN;
            // this.onRun.notifyObservers(true);
        } else if (this.states.JUMPED && !this.states.FALLING) {
            this._currentAnim = this.animations.JUMP;
        } else if (!this.states.FALLING && this.states.GROUNDED) {
            this._currentAnim = this.animations.IDLE
            // only notify observer if it's playing
            // if(this.scene.getSoundByName("walking").isPlaying){
                // this.onRun.notifyObservers(false);
            // }
        // } else if (this.states.FALLING) {
            // this._currentAnim = this._jump;//_land;
        }

        //Animations
        if(this._currentAnim != null && this._prevAnim !== this._currentAnim){
            this._prevAnim.stop();
            // this._currentAnim.play(this._currentAnim.loopAnimation)
            this._currentAnim.start(this._currentAnim.loopAnimation, 1.0, 0, 90);
            // GAME.currentLevel.assets.playMeshAnimationNum('player', 1,  0, 60);
            this._prevAnim = this._currentAnim;
        }
    }

    //--GROUND DETECTION--
    //Send raycast to the floor to detect if there are any hits with meshes below the character
    _floorRaycast(offsetx, offsetz, raycastlen) {
        //position the raycast from bottom center of mesh
        var raycastFloorPos = new BABYLON.Vector3(this.mesh.position.x + offsetx, this.mesh.position.y + 0.5, this.mesh.position.z + offsetz);
        var ray = new BABYLON.Ray(raycastFloorPos, BABYLON.Vector3.Up().scale(-1), raycastlen);

        // ray caster debugger / visualization:
        // var rayHelper = new BABYLON.RayHelper(ray);
        // rayHelper.show(this.scene);

        //defined which type of meshes should be pickable
        var predicate = function (mesh) {
            return mesh.isPickable && mesh.isEnabled();
        }

        var pick = this.scene.pickWithRay(ray, predicate);

        if (pick.hit) { //grounded
            return pick.pickedPoint;
        } else { //not grounded
            return BABYLON.Vector3.Zero();
        }
    }

    //raycast from the center of the player to check for whether player is grounded
    _isGrounded() {
        if (this._floorRaycast(0, 0, 1.0).equals(BABYLON.Vector3.Zero())) {
            return false;
        } else {
            return true;
        }
    }

    //https://www.babylonjs-playground.com/#FUK3S#8
    //https://www.html5gamedevs.com/topic/7709-scenepick-a-mesh-that-is-enabled-but-not-visible/
    //check whether a mesh is sloping based on the normal
    _checkSlope() {

        //only check meshes that are pickable and enabled (specific for collision meshes that are invisible)
        var predicate = function (mesh) {
            return mesh.isPickable && mesh.isEnabled();
        }

        //4 raycasts outward from center
        var raycast = new BABYLON.Vector3(this.mesh.position.x, this.mesh.position.y + 0.5, this.mesh.position.z + .25);
        var ray = new BABYLON.Ray(raycast, BABYLON.Vector3.Up().scale(-1), 1.5);
        var pick = this.scene.pickWithRay(ray, predicate);

        var raycast2 = new BABYLON.Vector3(this.mesh.position.x, this.mesh.position.y + 0.5, this.mesh.position.z - .25);
        var ray2 = new BABYLON.Ray(raycast2, BABYLON.Vector3.Up().scale(-1), 1.5);
        var pick2 = this.scene.pickWithRay(ray2, predicate);

        var raycast3 = new BABYLON.Vector3(this.mesh.position.x + .25, this.mesh.position.y + 0.5, this.mesh.position.z);
        var ray3 = new BABYLON.Ray(raycast3, BABYLON.Vector3.Up().scale(-1), 1.5);
        var pick3 = this.scene.pickWithRay(ray3, predicate);

        var raycast4 = new BABYLON.Vector3(this.mesh.position.x - .25, this.mesh.position.y + 0.5, this.mesh.position.z);
        var ray4 = new BABYLON.Ray(raycast4, BABYLON.Vector3.Up().scale(-1), 1.5);
        var pick4 = this.scene.pickWithRay(ray4, predicate);

        if (pick.hit && !pick.getNormal().equals(BABYLON.Vector3.Up())) {
            if(pick.pickedMesh.name.includes("stair")) { 
                return true; 
            }
        } else if (pick2.hit && !pick2.getNormal().equals(BABYLON.Vector3.Up())) {
            if(pick2.pickedMesh.name.includes("stair")) { 
                return true; 
            }
        }
        else if (pick3.hit && !pick3.getNormal().equals(BABYLON.Vector3.Up())) {
            if(pick3.pickedMesh.name.includes("stair")) { 
                return true; 
            }
        }
        else if (pick4.hit && !pick4.getNormal().equals(BABYLON.Vector3.Up())) {
            if(pick4.pickedMesh.name.includes("stair")) { 
                return true; 
            }
        }
        return false;
    }

    _updateGroundDetection() {
        this._deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;

        //if not grounded
        if (!this._isGrounded()) {
            //if the body isnt grounded, check if it's on a slope and was either falling or walking onto it
            if (this._checkSlope() && this._gravity.y <= 0) {
                console.log("slope")
                //if you are considered on a slope, you're able to jump and gravity wont affect you
                this._gravity.y = 0;
                this._jumpCount = 1;
                this.states.GROUNDED = true;
            } else {
                //keep applying gravity
                this._gravity = this._gravity.addInPlace(BABYLON.Vector3.Up().scale(this._deltaTime * this.GRAVITY));
                this.states.GROUNDED = false;
            }
        }

        //limit the speed of gravity to the negative of the jump power
        if (this._gravity.y < -this.JUMP_FORCE) {
            this._gravity.y = -this.JUMP_FORCE;
        }

        //cue falling animation once gravity starts pushing down
        if (this._gravity.y < 0 && this.states.JUMPED) { //todo: play a falling anim if not grounded BUT not on a slope
            this.states.FALLING = true;
        }

        //update our movement to account for jumping
        this.mesh.moveWithCollisions(this._moveDirection.addInPlace(this._gravity));

        if (this._isGrounded()) {
            this._gravity.y = 0;
            this.states.GROUNDED = true;
            //keep track of last known ground position
            this._lastGroundPos.copyFrom(this.mesh.position);

            this._jumpCount = 1;

            //jump & falling animation flags
            this.states.JUMPED = false;
            this.states.FALLING = false;

        }

        //Jump detection
        if (this._input.jumpKeyDown && this._jumpCount > 0) {
            // this.position.y += 1;
            this._gravity.y = this.JUMP_FORCE;
            this._jumpCount--;

            //jumping and falling animation flags
            this.states.JUMPED = true;
            this.states.FALLING = false;
            // this._jumpingSfx.play();

            //tutorial, if the player jumps for the first time
            if(!this.tutorial_jump){
                this.tutorial_jump = true;
            }
        }

        // prevent to fall from 0 level ground:
        if (this.mesh.position.y < 0.1) this.mesh.position.y = 0.1

    }

    /* ACTIONS */

    _runChecksActions() {

        // run for each action: if cond1 [and/or cond2] then do xyz:

        // if animator was given a new pos
        if (this.animator.moveToPos) this.states.IN_ANIMATION = true;

        // calculate distances:
        if (this.states.IN_ANIMATION) {
            var distance_pos = Math.abs(this.mesh.position.x - this.animator.moveToPos.x) + 
                       Math.abs(this.mesh.position.z - this.animator.moveToPos.z);
        };
        // console.log('distance to pos:', distance_pos);
        
        // ACTION1: move to position:
        if (this.states.IN_ANIMATION) {
            var mh = -(this.mesh.position.x - this.animator.moveToPos.x) / 
                    (Math.abs(this.mesh.position.x - this.animator.moveToPos.x)+0.001);
            var mv = -(this.mesh.position.z - this.animator.moveToPos.z) / 
                    (Math.abs(this.mesh.position.z - this.animator.moveToPos.z)+0.001);
            this._input.horizontal = BABYLON.Scalar.Lerp(0.5*mh, 1, 0.2);
            this._input.vertical = BABYLON.Scalar.Lerp(0.5*mv, 1, 0.2);
            if (distance_pos < 2) {
                this.states.IN_ANIMATION = false; // end animation
                this.animator.moveToPos = null;
                this.distToPos = null;
                // this.level.cam.attach2Player(); //reconnect camera to player - end movie mode
            }
        }
    
    }

    //--GAME UPDATES--
    _beforeRenderUpdate() {
        this._runChecksActions();
        this._updateFromControls();
        this._updateGroundDetection();
        this._animatePlayer();
    }

}