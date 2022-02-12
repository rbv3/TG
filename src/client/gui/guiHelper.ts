
import * as THREE from 'three';
import { GUI } from 'dat.gui';

export function setDirectionalLightGUI(gui: GUI,directionalLight: THREE.DirectionalLight): void {
    const lightFolder = gui.addFolder('Directional Light');
    lightFolder.add(directionalLight.position, 'x', -3000, 3000);
    lightFolder.add(directionalLight.position, 'y', -3000, 3000);
    lightFolder.add(directionalLight.position, 'z', 0, 500);
}

export function setAllMaterialGUI(gui: GUI, materials: THREE.MeshPhongMaterial[]): void {
    const [buildingMaterial, parkMaterial, waterMaterial, surfaceMaterial] = materials;

    const data = {
        buildingColor: buildingMaterial.color.getHex(),
        parkColor: parkMaterial.color.getHex(),
        waterColor: waterMaterial.color.getHex(),
        surfaceColor: surfaceMaterial.color.getHex()
    };

    const buildingMaterialFolder = gui.addFolder('Building Material');
    buildingMaterialFolder.add(buildingMaterial, 'opacity', 0, 1).onChange( handleBuildingOpacityChange(buildingMaterial));
    buildingMaterialFolder.addColor( data, 'buildingColor' ).onChange( handleColorChange( buildingMaterial.color ) );
    // buildingMaterialFolder.open();

    const waterMaterialFolder = gui.addFolder('Water Material');
    waterMaterialFolder.add(waterMaterial, 'opacity', 0, 1);
    waterMaterialFolder.addColor( data, 'waterColor' ).onChange( handleColorChange( waterMaterial.color ) );

    const parkMaterialFolder = gui.addFolder('Park Material');
    parkMaterialFolder.add(parkMaterial, 'opacity', 0, 1);
    parkMaterialFolder.addColor( data, 'parkColor' ).onChange( handleColorChange( parkMaterial.color ) );

    const surfaceMaterialFolder = gui.addFolder('Surface Material');
    surfaceMaterialFolder.addColor( data, 'surfaceColor' ).onChange( handleColorChange( surfaceMaterial.color ) );
}

export function setShaderGUI(gui: GUI, material: THREE.ShaderMaterial): void {
    const shaderMaterialFolder = gui.addFolder('Shader Material');
    shaderMaterialFolder.add(material.uniforms.scale.value, 'z', 0, 2);
    shaderMaterialFolder.add(material.uniforms.scale.value, 'x', 0, 2);
    shaderMaterialFolder.add(material.uniforms.opacity, 'value', 0, 1).name('opacity');
    shaderMaterialFolder.add(material.uniforms.radius, 'value', 0, 1000).name('radius');
    shaderMaterialFolder.open();
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