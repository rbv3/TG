
import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { getAllMaterials } from '../render/renderHelper';

let interval: NodeJS.Timer;

const ramaController = {
    isRamaOn: false,
    isDistanceRamaOn: false
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
    buildingMaterialFolder.add(invisibleBuildingShaderMaterial.uniforms.radius, 'value', 0, 3000).name('invisibility radius').onChange((radius) => {
        materials.forEach(material => {
            material.uniforms.radius.value = radius;
        });
    });
    buildingMaterialFolder.add(visibleBuildingShaderMaterial.uniforms.diameter, 'value', 500, 20000).name('diameter').onChange((diameter) => {
        materials.forEach(material => {
            material.uniforms.diameter.value = diameter;
        });
    }).listen();
    buildingMaterialFolder.add(ramaController, 'isRamaOn').name('Rama').onChange((isRamaOn) => {
        clearInterval(interval);
        setAllMaterialsRamaMode(true);
        
        if(isRamaOn) {
            setAllMaterialsDistanceRamaMode(false);
            ramaController.isDistanceRamaOn = false;
            animateRamaMode(20000, 2000, true, false);
        }
        else animateRamaMode(2000, 20000, false, false);
    }).listen();
    buildingMaterialFolder.add(ramaController, 'isDistanceRamaOn').name('Distance Rama').onChange((isDistanceRamaOn) => {
        clearInterval(interval);
        setAllMaterialsDistanceRamaMode(true);
        
        if(isDistanceRamaOn) {
            setAllMaterialsRamaMode(false);
            ramaController.isRamaOn = false;
            animateRamaMode(20000, 2000, false, true);
        }
        else animateRamaMode(2000, 20000, false, false);
    }).listen();

    buildingMaterialFolder.open();

    const waterMaterialFolder = gui.addFolder('Water Material');
    waterMaterialFolder.add(waterShaderMaterial.uniforms.scale.value, 'z', 0, 20);
    waterMaterialFolder.add(waterShaderMaterial.uniforms.scale.value, 'x', 0, 2);

    const parkMaterialFolder = gui.addFolder('Park Material');
    parkMaterialFolder.add(parkShaderMaterial.uniforms.scale.value, 'z', 0, 20);
    parkMaterialFolder.add(parkShaderMaterial.uniforms.scale.value, 'x', 0, 2);
}

function animateRamaMode( initial: number, goal: number, isRamaOn: boolean, isDistanceRamaOn: boolean) {
    const materials = getAllMaterials();
    const referenceMaterial = materials[0];
    materials.forEach(material => material.uniforms.diameter.value = initial);

    const diameterSpeed = 500;
    interval = setInterval(() => {
        if(referenceMaterial.uniforms.diameter.value === goal) {
            setAllMaterialsRamaMode(isRamaOn);
            setAllMaterialsDistanceRamaMode(isDistanceRamaOn);
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

function setAllMaterialsRamaMode(isRamaOn: boolean) {
    const materials = getAllMaterials();
    materials.forEach((material) => {
        material.uniforms.isRamaOn.value = isRamaOn;
    });
}

function setAllMaterialsDistanceRamaMode(isDistanceRamaOn: boolean) {
    const materials = getAllMaterials();
    materials.forEach((material) => {
        material.uniforms.isDistanceRamaOn.value = isDistanceRamaOn;
    });
}
