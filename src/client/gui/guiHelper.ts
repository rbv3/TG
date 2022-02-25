
import * as THREE from 'three';
import { GUI } from 'dat.gui';

export function setDirectionalLightGUI(gui: GUI,directionalLight: THREE.DirectionalLight): void {
    const lightFolder = gui.addFolder('Directional Light');
    lightFolder.add(directionalLight.position, 'x', -3000, 3000);
    lightFolder.add(directionalLight.position, 'y', -3000, 3000);
    lightFolder.add(directionalLight.position, 'z', 0, 3000);
}

export function setAllMaterialGUI(gui: GUI, materials: THREE.ShaderMaterial[]): void {
    const [
        visibleBuildingShaderMaterial, 
        invisibleBuildingShaderMaterial, 
        parkShaderMaterial, 
        waterShaderMaterial] = materials;

    const invisibleBuildingMaterialFolder = gui.addFolder('Invisible Building Material');
    invisibleBuildingMaterialFolder.add(invisibleBuildingShaderMaterial.uniforms.scale.value, 'y', 0, 2).name('height scale');
    invisibleBuildingMaterialFolder.add(invisibleBuildingShaderMaterial.uniforms.scale.value, 'x', 0, 2);
    invisibleBuildingMaterialFolder.add(invisibleBuildingShaderMaterial.uniforms.opacity, 'value', 0, 1).name('opacity');
    invisibleBuildingMaterialFolder.add(invisibleBuildingShaderMaterial.uniforms.radius, 'value', 0, 1000).name('radius').onChange(() => {
        visibleBuildingShaderMaterial.uniforms.radius.value = invisibleBuildingShaderMaterial.uniforms.radius.value;
    });
    invisibleBuildingMaterialFolder.add(invisibleBuildingShaderMaterial.uniforms.diameter, 'value', 0, 1000).name('diameter');
    invisibleBuildingMaterialFolder.open();

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