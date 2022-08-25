export default class UI {

    constructor(uiName) {
        this.currentControlID = 0;
        this.controls = [];

        this.menuTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(uiName, true);
    }

    addMiniMenuButton(name, text, panel, options={}) {
        var button = BABYLON.GUI.Button.CreateSimpleButton(name, text);
        button.width = "25px";
        button.height = "25px";
        button.color = "white";
        button.background = "transparent";
        if (options.onclick) { button.onPointerClickObservable.add(options.onclick); }
        panel.addControl(button);
        return button;
    }

    addButtonGrid(name, text, options={}) {
        var button = BABYLON.GUI.Button.CreateSimpleButton(name, text);
        button.width = "75px";
        button.height = "25px";
        button.color = "white";
        button.background = "transparent";
        if (options.onclick) { button.onPointerClickObservable.add(options.onclick); }
        return button;
    }

    addMenuCheckBox(name, text, panel, options={}) {
        var checkbox = new BABYLON.GUI.Checkbox();
        checkbox.width = "20px";
        checkbox.height = "20px";
        checkbox.color = "white";
        checkbox.background = "transparent";
        if (options.onclick) { checkbox.onIsCheckedChangedObservable.add(options.onclick); }
        panel.addControl(checkbox); 
        var header = new BABYLON.GUI.TextBlock();
        header.text = text
        header.width = "120px";
        header.height = "20px";
        header.color = "white";
        header.background = "transparent";
        header.textHorizontalAlignment = (typeof options.horizontalAlignment !== 'undefined') ? options.horizontalAlignment : BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.addControl(header);
        return checkbox, header;
    }

    addButton(name, text, options = {}) {
        let button = BABYLON.GUI.Button.CreateSimpleButton(name, text);
        
        button.width = options.width || '90px';
        button.height = options.height || '40px';
        button.color = options.color || 'black';
        button.outlineWidth = options.outlineWidth || 0;
        button.outlineColor = options.outlineColor || button.color;
        button.alpha = (typeof options.alpha !== 'undefined') ? button.alpha : 1;
        button.background = options.background || 'transparent';
        button.left = options.left || '0px';
        button.top = options.top || '0px';
        button.textHorizontalAlignment = (typeof options.horizontalAlignment !== 'undefined') ? options.horizontalAlignment : BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        button.textVerticalAlignment = (typeof options.verticalAlignment !== 'undefined') ? options.verticalAlignment : BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

        if(options.onclick) {
            button.onPointerUpObservable.add(options.onclick);
        }

        this.menuTexture.addControl(button);
        this.add(button);

        return button;
    }

    addTextGrid(text, options = {}) {
        let textControl = new BABYLON.GUI.TextBlock();
        textControl.text = text;
        textControl.color = options.color || 'white';
        textControl.fontSize = options.fontSize || 28;
        textControl.outlineWidth = options.outlineWidth || 0;
        textControl.outlineColor = options.outlineColor || "white";
        textControl.lineSpacing = options.lineSpacing || '5px';
        textControl.left = options.left || '0px';
        textControl.top = options.top || '0px';
        textControl.textHorizontalAlignment = (typeof options.horizontalAlignment !== 'undefined') ? options.horizontalAlignment : BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        textControl.textVerticalAlignment = (typeof options.verticalAlignment !== 'undefined') ? options.verticalAlignment : BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        textControl.textWrapping = options.wrapping || true;
        return textControl;
    }

    addText(text, options = {}) {
        let textControl = this.addTextGrid(text, options);
        this.menuTexture.addControl(textControl);
        this.add(textControl);
        return textControl;
    }

    addTextPanel(text, panel, options = {}) {
        let textControl = this.addTextGrid(text, options);
        panel.addControl(textControl);
        return textControl;
    }

    addImage(name, file, options) {
        let image = new BABYLON.GUI.Image(name, file);
        
        image.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
        image.width = options.width;
        image.height = options.height;
        image.left = options.left || '0px';
        image.top = options.top || '0px';
        image.textHorizontalAlignment = (typeof options.horizontalAlignment !== 'undefined') ? options.horizontalAlignment : BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        image.textVerticalAlignment = (typeof options.verticalAlignment !== 'undefined') ? options.verticalAlignment : BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

        this.menuTexture.addControl(image);
        this.add(image);

        return image;
    }


    addColorPicker(obj) {
        var panel = new BABYLON.GUI.StackPanel();
        panel.width = "200px";
        panel.isVertical = true;

        var textBlock = new BABYLON.GUI.TextBlock();
        textBlock.text = "Diffuse color:";
        textBlock.height = "30px";
        panel.addControl(textBlock);     

        var picker = new BABYLON.GUI.ColorPicker();
        picker.value = obj.color;
        picker.height = "150px";
        picker.width = "150px";
        picker.onValueChangedObservable.add(function(value) { // value is a color3
            obj.color.copyFrom(value);
        });

        panel.addControl(picker);
        return panel;
    }

    miniMenu(obj) {
        var panel = new BABYLON.GUI.StackPanel();
        panel.isVertical = false;
        panel.isVisible = false;
        this.menuTexture.addControl(panel);
        this.addMiniMenuButton("button0", "+", panel, {
            'onclick': () => {
                obj._editMenu.isVisible = !obj._editMenu.isVisible;
                obj._miniMenu.isVisible = !obj._miniMenu.isVisible;}
            });
        this.addMiniMenuButton("button1", "x", panel, {
            'onclick': () => obj.destroy() });
        panel.linkWithMesh(obj.mesh)
        panel.linkOffsetX = 100;
        panel.linkOffsetY = 30;
        return panel;
    }

    addPanelProps(obj) {
        var panel = new BABYLON.GUI.StackPanel();
        panel.isVertical = false;
        // panel.width = '1000px';
        // panel.height = '80px';

        // DESTRUCTIBLE checkbox:
        this.addMenuCheckBox("cb0", "Destructible", panel, {
            'onclick': () => obj.destructible = !obj.destructible });
        // DESTRUCTIVE checkbox:
        this.addMenuCheckBox("cb1", "Destructive", panel, {
            'onclick': () => obj.destructive = !obj.destructive });
        // VISIBLE checkbox:
        this.addMenuCheckBox("cb2", "Visible", panel, {
            'onclick': () => obj.mesh.isVisible = !obj.mesh.isVisible });
        return panel;
    }

    addObjSelector(level, addObjList) {
        var panel = new BABYLON.GUI.StackPanel();
        this.menuTexture.addControl(panel);
        panel.top = "-25%"
        panel.left = "-30%"

        var textblock = new BABYLON.GUI.TextBlock();
        textblock.height = "50px";
        panel.addControl(textblock);   

        var addRadio = function(text, parent) {

            var button = new BABYLON.GUI.RadioButton();
            button.width = "20px";
            button.height = "20px";
            button.color = "white";
            button.background = "green";     

            button.onIsCheckedChangedObservable.add(function(state) {
                if (state) {
                    textblock.text = text;
                    level.addObj(text)
                    panel.isVisible = false
                    parent = null;
                }
            }); 

            var header = BABYLON.GUI.Control.AddHeader(button, text, "100px", { isHorizontal: true, controlFirst: true });
            header.height = "30px";

            parent.addControl(header);    
        }

        addObjList.forEach( (obj) =>  {   
            addRadio(obj, panel);
        });
        
        return panel;
    }

    editMenu(obj) {
        var grid = new BABYLON.GUI.Grid();
        grid.isVisible = false;
        grid.background = "gray"; 
        this.menuTexture.addControl(grid); 
        grid.width = "500px";
        grid.height = "300px";
        grid.addColumnDefinition(1.0);
        grid.addRowDefinition(20, true);
        grid.addRowDefinition(30, true);
        grid.addRowDefinition(20, true);
        grid.addRowDefinition(200, true);
        grid.addRowDefinition(30, true);

        var text = this.addTextGrid("Properties:", {fontSize:20});
        grid.addControl(text, 0, 0);

        var p1 = this.addPanelProps(obj);
        grid.addControl(p1, 1, 0);

        var text2 = this.addTextGrid("Attributes:", {fontSize:20});
        grid.addControl(text2, 2, 0);

        var cp = this.addColorPicker(obj);
        grid.addControl(cp, 3, 0);

        var bdone = this.addButtonGrid("button0", "done", {
            'onclick': () => {
                obj._editMenu.isVisible = !obj._editMenu.isVisible;
                obj._miniMenu.isVisible = !obj._miniMenu.isVisible;
            } });
        grid.addControl(bdone, 4, 0);

        grid.linkWithMesh(obj.mesh);
        // grid.linkOffsetX = '-400px';
        grid.linkOffsetY = '300px';

        return grid;

        // ;(async () => {
        //     let loadedGUI = await this.menuTexture.parseFromURLAsync("https://doc.babylonjs.com/examples/ColorPickerGui.json");
        // })()
    }

    add(control) {
        control.uiControlID = this.currentControlID++;
        this.controls.push(control);
    }

    remove(control) {
        control.isVisible = false;
        this.controls.splice(control.uiControlID, 1);
    }

    show() {
        this.controls.forEach(control => control.isVisible = true);
    }

    hide() {
        this.controls.forEach(control => control.isVisible = false);
    }

}