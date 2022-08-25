// random object mesh to be added from a database:

import ConstructionBlock from './ConstructionBlock.js';

export default class RandoObj extends ConstructionBlock {

    create(meshName) {
        this.mesh = this.level.assets.getMesh(meshName);
        this.mesh.scaling = this.size;
        this.mesh.position = this.position;
        this.mesh.rotation = this.rotation;

        this.mesh.setEnabled(true)
        this.mesh.isPickable = true;
        this.mesh.checkCollisions = true;

        // // colors and materials 
        // var boxMaterial = new BABYLON.StandardMaterial('blockmat', this.level.scene);
        // if (this.color) boxMaterial.emissiveColor = this.color;
        // else { 
        //     boxMaterial.emissiveColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        // }
        // this.mesh.material = boxMaterial;
        // this.color = this.mesh.material.emissiveColor; // update object color

        BABYLON.Tags.AddTagsTo(this.mesh, meshName);

        // this._miniMenu = this.level.ui.miniMenu(this);
        // this._editMenu = this.level.ui.editMenu(this);
    
        return this;
    }

}