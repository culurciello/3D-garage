
export class PlayerInput {

    constructor(scene) {

        this.scene = scene;

        // character controller:
        this.jumpKey = 32; // Spacebar
        this.forwardKey = 87;//87, 38]; // W or UP Arrow
        this.backKey = 83;//83, 40]; // S or DOWN ARROW
        this.leftKey = 65;//65, 37]; // A or LEFT ARROW
        this.rightKey = 68;//68, 39]; // D or RIGHT ARROW
        this.inputMap = [];//{};
        
        this.scene.onKeyboardObservable.add(
            keyboardEventHandler, 
            BABYLON.KeyboardEventTypes.KEYDOWN + BABYLON.KeyboardEventTypes.KEYUP
        );

        function keyboardEventHandler(evtData){
            let evt = evtData.event;
            if(evt.repeat) return; // Ignore repeats from holding a key down.

            switch(evtData.type){
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    keyboardProcessKeyDown(evt.key, evt.keyCode);
                break;
                case BABYLON.KeyboardEventTypes.KEYUP:
                    keyboardProcessKeyUp(evt.key, evt.keyCode);
                break;

            }
        }

        function keyboardProcessKeyDown(key, code){
            GAME.currentLevel.player._input.inputMap[code] = true;
            // console.log("KEYDOWN REGISTERED FOR KEY; ", key, " WITH KEYCODE; ", code);
        }

        function keyboardProcessKeyUp(key, code){
            GAME.currentLevel.player._input.inputMap[code] = false;
            // console.log("KEYUP REGISTERED FOR KEY; ", key, " WITH KEYCODE; ", code);
        }

        //add to the scene an observable that calls updateFromKeyboard before rendering
        this.scene.onBeforeRenderObservable.add(() => {
            this._updateFromKeyboard();
        });

    }

    // Keyboard controls & Mobile controls
    //handles what is done when keys are pressed or if on mobile, when buttons are pressed
    _updateFromKeyboard() {

        //forward - backwards movement
        if (this.inputMap[this.backKey]) {
            this.verticalAxis = 1;
            this.vertical = BABYLON.Scalar.Lerp(this.vertical, 1, 0.2);
            // console.log('we move forward!')

        } else if (this.inputMap[this.forwardKey]) {
            this.vertical = BABYLON.Scalar.Lerp(this.vertical, -1, 0.2);
            this.verticalAxis = -1;
        } else {
            this.vertical = 0;
            this.verticalAxis = 0;
        }

        //left - right movement
        if (this.inputMap[this.rightKey]) {
            //lerp will create a scalar linearly interpolated amt between start and end scalar
            //taking current horizontal and how long you hold, will go up to -1(all the way left)
            this.horizontal = BABYLON.Scalar.Lerp(this.horizontal, -1, 0.2);
            this.horizontalAxis = -1;

        } else if (this.inputMap[this.leftKey] ) {
            this.horizontal = BABYLON.Scalar.Lerp(this.horizontal, 1, 0.2);
            this.horizontalAxis = 1;
        }
        else {
            this.horizontal = 0;
            this.horizontalAxis = 0;
        }

        //dash
        // if (this.inputMap["Shift"]) {
        //     this.dashing = true;
        // } else {
        //     this.dashing = false;
        // }

        //Jump Checks (SPACE)
        if (this.inputMap[this.jumpKey]) {
            this.jumpKeyDown = true;
        } else {
            this.jumpKeyDown = false;
        }
    }

}