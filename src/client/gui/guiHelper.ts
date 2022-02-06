
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
    buildingMaterialFolder.add(buildingMaterial, 'opacity', 0, 1);
    buildingMaterialFolder.addColor( data, 'buildingColor' ).onChange( handleColorChange( buildingMaterial.color ) );
    buildingMaterialFolder.open();

    const waterMaterialFolder = gui.addFolder('Water Material');
    waterMaterialFolder.add(waterMaterial, 'opacity', 0, 1);
    waterMaterialFolder.addColor( data, 'waterColor' ).onChange( handleColorChange( waterMaterial.color ) );

    const parkMaterialFolder = gui.addFolder('Park Material');
    parkMaterialFolder.add(parkMaterial, 'opacity', 0, 1);
    parkMaterialFolder.addColor( data, 'parkColor' ).onChange( handleColorChange( parkMaterial.color ) );

    const surfaceMaterialFolder = gui.addFolder('Surface Material');
    surfaceMaterialFolder.addColor( data, 'surfaceColor' ).onChange( handleColorChange( surfaceMaterial.color ) );
}

function handleColorChange( color: THREE.Color ) {
    return function ( value: number) {
        color.setHex( value );
    };
}