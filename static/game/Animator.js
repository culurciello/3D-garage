// adds custom animations to any objects in the scene

// here we can store some default animations that are typically used:
const defaultAnimations = [
        
        {name: "BOUNCE_UP", property: "position.y",
            framerate: 30.0, 
            pprop: BABYLON.Animation.ANIMATIONTYPE_FLOAT, 
            loop: BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
            keyframes: [
                { frame: 0, value: 1 },
                { frame: 30, value: 3 },
                { frame: 60, value: 1 } 
            ]
        },

        // {},

        ];

export default class GarageAnimator {

    constructor(target) {
        this.target = target; // animation target object
        this.scene = target.scene;
        // this.animations = [];
        this.moveToPos = null;
        this.currentAnimation = null;
    }


    addAnimation(anim) {

        if (anim.type == "move") {

            this.moveToPos = anim.pos;
            // console.log('added move animation for', this.target);

        } else if (anim.type == "action") { 

            // get default animation by than name
            var defaultAnim = defaultAnimations.find(element => element.name == anim.name);

            anim.property = anim.property || defaultAnim.property;
            // framerate = anim.framerate || defaultAnim.framerate;
            anim.pprop = anim.pprop || defaultAnim.pprop;
            anim.loop = anim.lopp || defaultAnim.loop;
            anim.keyframes = anim.keyframes || defaultAnim.keyframes;

            // console.log(typeof anim.framerate)

            this.currentAnimation = new BABYLON.Animation(anim.name, anim.property, 
                    30, anim.pprop, anim.loop);

            this.currentAnimation.setKeys(anim.keyframes);

            this.target.mesh.animations.push(this.currentAnimation);
            // console.log('added action animation for', this.target);

        } else {
            // error!
        }

    }

    startAnimation(name) {
        // TBD: find the animation with name and use that!
        // his.currentAnimation = this.target.animations.find(element => element.name == "BOUNCE_UP");
        if (!this.target.IN_ANIMATION) {
            this.target.IN_ANIMATION = true;
            this.scene.beginAnimation(this.target.mesh, 0, 60, false);
            console.log('start anim!');
        }
    }

    stopAnimation(name) {
        // TBD: find the animation with name and use that!
        // his.currentAnimation = this.target.animations.find(element => element.name == "BOUNCE_UP");
        if (this.target.IN_ANIMATION) {
            this.target.IN_ANIMATION = false;  
            // this.currentAnimation.stop();
            console.log('stopped anim!');
        }
    }

}
