
import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { getAllMaterials } from '../render/renderHelper';

let interval: NodeJS.Timer;
const ramaController = {
    isRamaOn: false
};

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
        waterShaderMaterial,
        surfaceShaderMaterial
    ] = materials;

    const buildingMaterialFolder = gui.addFolder('Building Material');
    buildingMaterialFolder.add(invisibleBuildingShaderMaterial.uniforms.opacity, 'value', 0, 0.5).name('opacity').step(0.05);
    buildingMaterialFolder.add(visibleBuildingShaderMaterial.uniforms.scale.value, 'z', 0, 10).name('scaleZ').step(0.05);
    buildingMaterialFolder.add(invisibleBuildingShaderMaterial.uniforms.radius, 'value', 0, 10000).name('invisibility radius').onChange(() => {
        visibleBuildingShaderMaterial.uniforms.radius.value = invisibleBuildingShaderMaterial.uniforms.radius.value;
    });
    buildingMaterialFolder.add(visibleBuildingShaderMaterial.uniforms.diameter, 'value', 1000, 20000).name('diameter').onChange(() => {
        materials.forEach(material => {
            material.uniforms.diameter.value = visibleBuildingShaderMaterial.uniforms.diameter.value;
        });
    });
    buildingMaterialFolder.add(ramaController, 'isRamaOn').name('Rama').onChange((isRamaOn) => {
        clearInterval(interval);
        materials.forEach(material => {
            material.uniforms.isRamaOn.value = true;
        });
        if(isRamaOn) animateRamaMode(20000, 2000, true);
        else animateRamaMode(2000, 20000, false);
    });
    buildingMaterialFolder.open();

    const waterMaterialFolder = gui.addFolder('Water Material');
    waterMaterialFolder.add(waterShaderMaterial.uniforms.scale.value, 'z', 0, 20);
    waterMaterialFolder.add(waterShaderMaterial.uniforms.scale.value, 'x', 0, 2);

    const parkMaterialFolder = gui.addFolder('Park Material');
    parkMaterialFolder.add(parkShaderMaterial.uniforms.scale.value, 'z', 0, 20);
    parkMaterialFolder.add(parkShaderMaterial.uniforms.scale.value, 'x', 0, 2);
}

function animateRamaMode( initial: number, goal: number, isRamaOn: boolean) {
    const [visibleShader, invisibleShader,
        parkShaderMaterial,
        waterShaderMaterial,
        surfaceShaderMaterial ] = getAllMaterials();
    const materials = [visibleShader, invisibleShader,
        parkShaderMaterial,
        waterShaderMaterial,
        surfaceShaderMaterial];
    const referenceMaterial = materials[0];
    materials.forEach(material => material.uniforms.diameter.value = initial);

    const diameterSpeed = 500;
    interval = setInterval(() => {
        if(referenceMaterial.uniforms.diameter.value === goal) {
            materials.forEach(material => material.uniforms.isRamaOn.value = isRamaOn);
            clearInterval(interval);
        }
        if(Math.abs(referenceMaterial.uniforms.diameter.value - goal) < 500) {
            materials.forEach(material => material.uniforms.diameter.value = goal);
        } else if(referenceMaterial.uniforms.diameter.value > goal) {
            materials.forEach(material => material.uniforms.diameter.value -= diameterSpeed);
        } else if(referenceMaterial.uniforms.diameter.value < goal) {
            materials.forEach(material => material.uniforms.diameter.value += diameterSpeed);
        }
    }, 50);
}
