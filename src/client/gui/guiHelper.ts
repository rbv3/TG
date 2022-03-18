
import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { getAllMaterials } from '../render/renderHelper';

let interval: NodeJS.Timer;

type animateRamaModeParams = {
    initial: number,
    goal: number,
    isRamaOn?: boolean,
    isDistanceRamaOn?: boolean,
    isXRamaOn?: boolean
}

const ramaController = {
    isRamaOn: false,
    isDistanceRamaOn: false,
    isXRamaOn: false
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
        invisibleBuildingShaderMaterial
    ] = materials;

    const effectsFolder = gui.addFolder('Effects');
    effectsFolder.add(invisibleBuildingShaderMaterial.uniforms.opacity, 'value', 0, 0.5).name('opacity').step(0.05);
    effectsFolder.add(invisibleBuildingShaderMaterial.uniforms.radius, 'value', 0, 3000).name('invisibility radius').onChange((radius) => {
        materials.forEach(material => {
            material.uniforms.radius.value = radius;
        });
    });

    effectsFolder.add(visibleBuildingShaderMaterial.uniforms.diameter, 'value', 500, 20000).name('diameter').onChange((diameter) => {
        materials.forEach(material => {
            material.uniforms.diameter.value = diameter;
        });
    }).listen();
    effectsFolder.add(ramaController, 'isRamaOn').name('Rama').onChange((isRamaOn) => {
        clearInterval(interval);
        setAllMaterialsRamaMode(true);
        
        if(isRamaOn) {
            setAllMaterialsDistanceRamaMode(false);
            setAllMaterialsXRamaMode(false);
            ramaController.isDistanceRamaOn = false;
            ramaController.isXRamaOn = false;
            animateRamaMode({initial: 20000, goal: 2000, isRamaOn: true});
        }
        else animateRamaMode({initial: 2000, goal: 20000, isRamaOn: false});
    }).listen();
    effectsFolder.add(ramaController, 'isDistanceRamaOn').name('Distance Rama').onChange((isDistanceRamaOn) => {
        clearInterval(interval);
        setAllMaterialsDistanceRamaMode(true);
        
        if(isDistanceRamaOn) {
            setAllMaterialsRamaMode(false);
            setAllMaterialsXRamaMode(false);
            ramaController.isRamaOn = false;
            ramaController.isXRamaOn = false;
            animateRamaMode({initial: 20000, goal: 2000, isDistanceRamaOn: true});
        }
        else animateRamaMode({initial: 2000, goal: 20000, isDistanceRamaOn: false});
    }).listen();
    effectsFolder.add(ramaController, 'isXRamaOn').name('X Rama').onChange((isXRamaOn) => {
        clearInterval(interval);
        setAllMaterialsXRamaMode(true);
        
        if(isXRamaOn) {
            setAllMaterialsRamaMode(false);
            setAllMaterialsDistanceRamaMode(false);
            ramaController.isRamaOn = false;
            ramaController.isDistanceRamaOn = false;
            animateRamaMode({initial: 20000, goal: 2000, isXRamaOn: true});
        }
        else animateRamaMode({initial: 2000, goal: 20000, isXRamaOn: false});
    }).listen();

    effectsFolder.open();
}

function animateRamaMode( {
    initial,
    goal,
    isRamaOn = false,
    isDistanceRamaOn = false,
    isXRamaOn = false
}: animateRamaModeParams) {
    const materials = getAllMaterials();
    const referenceMaterial = materials[0];
    materials.forEach(material => material.uniforms.diameter.value = initial);

    const diameterSpeed = 500;
    interval = setInterval(() => {
        if(referenceMaterial.uniforms.diameter.value === goal) {
            setAllMaterialsRamaMode(isRamaOn);
            setAllMaterialsDistanceRamaMode(isDistanceRamaOn);
            setAllMaterialsXRamaMode(isXRamaOn);
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

function setAllMaterialsXRamaMode(isXRamaOn: boolean) {
    const materials = getAllMaterials();
    materials.forEach((material) => {
        material.uniforms.isXRamaOn.value = isXRamaOn;
    });
}
