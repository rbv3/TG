
import * as THREE from 'three';
import { GUI } from 'dat.gui';

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
        waterShaderMaterial] = materials;

    const buildingMaterialFolder = gui.addFolder('Building Material');
    buildingMaterialFolder.add(invisibleBuildingShaderMaterial.uniforms.opacity, 'value', 0, 0.5).name('opacity').step(0.05);
    buildingMaterialFolder.add(invisibleBuildingShaderMaterial.uniforms.radius, 'value', 0, 1000).name('invisibility radius').onChange(() => {
        visibleBuildingShaderMaterial.uniforms.radius.value = invisibleBuildingShaderMaterial.uniforms.radius.value;
    });
    buildingMaterialFolder.add(visibleBuildingShaderMaterial.uniforms.diameter, 'value', 1000, 20000).name('diameter').onChange(() => {
        invisibleBuildingShaderMaterial.uniforms.diameter.value = visibleBuildingShaderMaterial.uniforms.diameter.value;
    });
    buildingMaterialFolder.add(ramaController, 'isRamaOn').name('Rama').onChange((isRamaOn) => {
        console.log({isRamaOn});
        clearInterval(interval);
        invisibleBuildingShaderMaterial.uniforms.isRamaOn.value = true;
        visibleBuildingShaderMaterial.uniforms.isRamaOn.value = true;
        if(isRamaOn) animateRamaMode(visibleBuildingShaderMaterial, invisibleBuildingShaderMaterial, 20000, 2000, true);
        else animateRamaMode(visibleBuildingShaderMaterial, invisibleBuildingShaderMaterial, 2000, 20000, false);
    });
    buildingMaterialFolder.open();

    const waterMaterialFolder = gui.addFolder('Water Material');
    waterMaterialFolder.add(waterShaderMaterial.uniforms.scale.value, 'z', 0, 20);
    waterMaterialFolder.add(waterShaderMaterial.uniforms.scale.value, 'x', 0, 2);

    const parkMaterialFolder = gui.addFolder('Park Material');
    parkMaterialFolder.add(parkShaderMaterial.uniforms.scale.value, 'z', 0, 20);
    parkMaterialFolder.add(parkShaderMaterial.uniforms.scale.value, 'x', 0, 2);
}

function animateRamaMode(
    visibleShader: THREE.ShaderMaterial, invisibleShader: THREE.ShaderMaterial, initial: number, goal: number, isRamaOn: boolean
) {
    visibleShader.uniforms.diameter.value = initial;
    invisibleShader.uniforms.diameter.value = initial;
    const diameterSpeed = 500;
    interval = setInterval(() => {
        if(visibleShader.uniforms.diameter.value === goal) {
            visibleShader.uniforms.isRamaOn.value = isRamaOn;
            invisibleShader.uniforms.isRamaOn.value = isRamaOn;
            clearInterval(interval);
        }

        if(Math.abs(visibleShader.uniforms.diameter.value - goal) < 500) {
            visibleShader.uniforms.diameter.value = goal;
            invisibleShader.uniforms.diameter.value = goal;
        } else if(visibleShader.uniforms.diameter.value > goal) {
            visibleShader.uniforms.diameter.value -= diameterSpeed;
            invisibleShader.uniforms.diameter.value -= diameterSpeed;
        } else if(visibleShader.uniforms.diameter.value < goal) {
            visibleShader.uniforms.diameter.value += diameterSpeed;
            invisibleShader.uniforms.diameter.value += diameterSpeed;
        }
    }, 50);
}
