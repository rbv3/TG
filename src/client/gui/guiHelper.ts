
import * as THREE from 'three';
import { GUI } from 'dat.gui';

export function setDirectionalLightGUI(gui: GUI,directionalLight: THREE.DirectionalLight): void {
    const lightFolder = gui.addFolder('Directional Light');
    lightFolder.add(directionalLight.position, 'x', -3000, 3000);
    lightFolder.add(directionalLight.position, 'y', -3000, 3000);
    lightFolder.add(directionalLight.position, 'z', 0, 500);
}

export function setAllMaterialGUI(gui: GUI, materials: THREE.ShaderMaterial[]): void {
    const [buildingShaderMaterial, parkShaderMaterial, waterShaderMaterial] = materials;


    const buildingMaterialFolder = gui.addFolder('Building Material');
    buildingMaterialFolder.add(buildingShaderMaterial.uniforms.scale.value, 'z', 0, 2);
    buildingMaterialFolder.add(buildingShaderMaterial.uniforms.scale.value, 'x', 0, 2);
    buildingMaterialFolder.add(buildingShaderMaterial.uniforms.opacity, 'value', 0, 1).name('opacity');
    buildingMaterialFolder.add(buildingShaderMaterial.uniforms.radius, 'value', 0, 1000).name('radius');
    buildingMaterialFolder.open();

    const waterMaterialFolder = gui.addFolder('Water Material');
    waterMaterialFolder.add(waterShaderMaterial.uniforms.scale.value, 'z', 0, 20);
    waterMaterialFolder.add(waterShaderMaterial.uniforms.scale.value, 'x', 0, 2);

    const parkMaterialFolder = gui.addFolder('Park Material');
    parkMaterialFolder.add(parkShaderMaterial.uniforms.scale.value, 'z', 0, 20);
    parkMaterialFolder.add(parkShaderMaterial.uniforms.scale.value, 'x', 0, 2);
}


function handleColorChange( color: THREE.Color ) {
    return function ( value: number) {
        color.setHex( value );
    };
}

function handleBuildingOpacityChange(buildingMaterial: THREE.MeshPhongMaterial) {
    return function() {
        const buildingOpacity = buildingMaterial.opacity;
        if(buildingOpacity < 0.95) {
            buildingMaterial.depthWrite = false;
        } else {
            buildingMaterial.depthWrite = true;
        }
    };
}