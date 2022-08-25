// we use follow camera from BabylonJS
// other #1: https://doc.babylonjs.com/guidedLearning/createAGame/playerCamera
// other FPS #2: https://www.babylonjs-playground.com/#H6FZQ2#21

export default class TLCamera {

    constructor(level) {
        this.level = level;
        this.scene = level.scene;
        this.fpsCameraPOS = new BABYLON.Vector3(0, 3.5, 15);
        this.fpsCamera = new BABYLON.FollowCamera("FollowCam", this.fpsCameraPOS, this.scene);
        // this.editCamera = new BABYLON.UniversalCamera("UniversalCamera", this.fpsCameraPOS, this.scene);
    }

    create() {
        this.camera = this.fpsCamera;
        // this.camera.inputs.clear();
        this.camera.radius = 15;
        this.camera.heightOffset = 5;
        this.camera.rotationOffset = 180;
        this.camera.attachControl(GAME.canvas, false);
   
        // this.camera.cameraAcceleration = 0.02;
        // this.camera.maxCameraSpeed = 10;
        // this.camera.wheelPrecision = 500; //Mouse wheel speed

        // this.camera.onCollide = function (collidedMesh) {
        //     if(collidedMesh.id == 'block') {
        //         console.log('camera collision with block')
        //         if (collidedMesh.block.destructible) {
        //             collidedMesh.block.destroy(); }
        //     }
        // }
        
        return this;
    }

    attach2Player() {
        // var transformNode = new BABYLON.TransformNode('blockTransformNode');
        // transformNode.parent = this.level.player.mesh; 
        // transformNode.rotation = new BABYLON.Vector3(0, Math.PI, 0);
        // transformNode.position = new BABYLON.Vector3(0,0,0);
        // this.camera.lockedTarget = transformNode;
        this.camera.lockedTarget = this.level.player.mesh;
        // console.log('attaching camera to player')
    }

    detachFromPlayer() {
        this.camera.lockedTarget = null;
    }

    // setCamera2Top() {
    //     this.camera = this.editCamera;
    //     this.camera.position = new BABYLON.Vector3(0, 100, 0)
    //     this.camera.setTarget(new BABYLON.Vector3(0,0,0));
    //     this.camera.applyGravity = false;
    // }
    
    // setCamera2FPS() {
    //     this.camera = this.fpsCamera;
    //     this.camera.position = this.fpsCameraPOS;
    //     this.camera.setTarget(new BABYLON.Vector3(0,2,0));
    //     this.camera.applyGravity = true;
    // }

}