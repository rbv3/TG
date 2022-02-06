import * as THREE from 'three';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { CityLayer, LayerType } from '../types';


let surfaceMaterial: THREE.MeshPhongMaterial;
let parkMaterial: THREE.MeshPhongMaterial;
let waterMaterial: THREE.MeshPhongMaterial;
let buildingMaterial: THREE.MeshPhongMaterial;

export function renderLayer(layer: CityLayer, group: THREE.Group, type: LayerType): void {
    const triangleMeshes: THREE.BufferGeometry[] = [];

    const {coordinates, indices, color} = layer;
    const [r, g, b, a] = color;
    // const {colorHex, opacity} = rgbaToHexColor(color);
    const opacity = a;
    const threeColor = new THREE.Color(r, g, b);

    drawTriangles(coordinates, indices, triangleMeshes);

    const mergedMeshes = mergeBufferGeometries(triangleMeshes);
    const material = getMaterialByLayerType(type, threeColor, opacity);
    
    mergedMeshes.computeVertexNormals();
    mergedMeshes.normalizeNormals();

    const singleMesh = new THREE.Mesh(mergedMeshes, material);
    group.add(singleMesh);
}

function drawTriangles(coordinates: number[], indices: number[], triangleMeshes: THREE.BufferGeometry[]): void {
    let i = 0;
    while(i < indices.length) {
        const triangleIndices = [indices[i], indices[i+1], indices[i+2]];
        
        drawTriangle(coordinates, triangleIndices, triangleMeshes);
        
        i += 3;
    }
}

function drawTriangle(coordinates: number[], triangleIndices: number[], triangleMeshes: THREE.BufferGeometry[] ): void {
    const geometry = new THREE.BufferGeometry();
    let positionVertices: number[] = [];

    triangleIndices.forEach(indice => {
        const newPoints = getCoordinate3dByIndex(coordinates, indice);
        positionVertices = [...positionVertices, ...newPoints];
    });

    const vertices = new Float32Array( [
        ...positionVertices
    ] );
    
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

    triangleMeshes.push(geometry);
}

function getCoordinate3dByIndex(coordinates: number[], index: number): number[] {
    const numberVertices = 3;
    const x = coordinates[index*numberVertices];
    const y = coordinates[index*numberVertices+1];
    const z = coordinates[index*numberVertices+2];
    return [x, y, z];
}

function getMaterialByLayerType(
    layerType: LayerType, 
    color: THREE.Color, 
    opacity: number
): THREE.MeshMatcapMaterial | THREE.MeshPhongMaterial {
    switch(layerType) {
        case LayerType.Surface: {
            surfaceMaterial = new THREE.MeshPhongMaterial( { color } );
            surfaceMaterial.opacity = opacity;
            surfaceMaterial.transparent = true;
            surfaceMaterial.normalMap;

            return surfaceMaterial;
        }
        case LayerType.Water: {
            waterMaterial = new THREE.MeshPhongMaterial( { color } );
            waterMaterial.opacity = opacity;
            waterMaterial.transparent = true;
            waterMaterial.normalMap;
            waterMaterial.reflectivity = 0.5;

            return waterMaterial;
        }
        case LayerType.Park: {
            parkMaterial = new THREE.MeshPhongMaterial( { color } );
            parkMaterial.opacity = opacity;
            parkMaterial.transparent = true;
            parkMaterial.normalMap;
            waterMaterial.reflectivity = 0.3;

            return parkMaterial;
        }
        case LayerType.Building: {
            buildingMaterial = new THREE.MeshPhongMaterial( { color } );
            buildingMaterial.opacity = opacity;
            buildingMaterial.transparent = true;
            buildingMaterial.normalMap;
            waterMaterial.reflectivity = 0.7;

            return buildingMaterial;
        }
    }
}

export function getAllMaterials(): THREE.MeshPhongMaterial[] {
    return [
        buildingMaterial,
        parkMaterial,
        waterMaterial,
        surfaceMaterial
    ];
}