import * as THREE from 'three';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { CityLayer, LayerType } from '../types';
import { _BuildingFragmentShader, _BuildingVertexShader, _FloorFragmentShader, _FloorVertexShader } from './helpers/shadersHelper';

let invisibleBuildingShaderMaterial: THREE.ShaderMaterial;
let visibleBuildingShaderMaterial: THREE.ShaderMaterial;
let waterShaderMaterial: THREE.ShaderMaterial;
let parkShaderMaterial: THREE.ShaderMaterial;
let surfaceShaderMaterial: THREE.ShaderMaterial;

export function renderLayer(layer: CityLayer, group: THREE.Group, type: LayerType, isVisible?: boolean): void {
    const triangleMeshes: THREE.BufferGeometry[] = [];
    const {coordinates, indices, color, normals} = layer;
    const [r, g, b, opacity] = color;
    const colorVector = new THREE.Vector3(r, g, b);

    drawTriangles(coordinates, indices, triangleMeshes, normals);

    const mergedMeshes = mergeBufferGeometries(triangleMeshes);
    const material = getMaterialByLayerType(type, colorVector, opacity, isVisible);
    
    mergedMeshes.computeVertexNormals();
    mergedMeshes.normalizeNormals();

    const singleMesh = new THREE.Mesh(mergedMeshes, material);
    singleMesh.castShadow = true;
    singleMesh.receiveShadow = true;
    group.add(singleMesh);
}

function drawTriangles(coordinates: number[], indices: number[], triangleMeshes: THREE.BufferGeometry[], normals?: number[]): void {
    let i = 0;
    while(i < indices.length) {
        const triangleIndices = [indices[i], indices[i+1], indices[i+2]];
        
        drawTriangle(coordinates, triangleIndices, triangleMeshes, normals);
        
        i += 3;
    }
}

function drawTriangle(coordinates: number[], triangleIndices: number[], triangleMeshes: THREE.BufferGeometry[], normals?: number[] ): void {
    const geometry = new THREE.BufferGeometry();
    let positionVertices: number[] = [];
    let normalsPoints: number[] = [];

    triangleIndices.forEach(indice => {
        const newPoints = getCoordinate3dByIndex(coordinates, indice);
        if(normals) normalsPoints = [...normalsPoints, ...getNormalsByIndex(normals, indice)];
        positionVertices = [...positionVertices, ...newPoints];
    });

    const vertices = new Float32Array( [
        ...positionVertices
    ] );
    const normalVertices = new Float32Array( [
        ...normalsPoints
    ] );
    
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    if(normals) geometry.setAttribute('normal',  new THREE.BufferAttribute(normalVertices, 3));

    triangleMeshes.push(geometry);
}

function getCoordinate3dByIndex(coordinates: number[], index: number): number[] {
    const numberVertices = 3;
    const x = coordinates[index*numberVertices];
    const y = coordinates[index*numberVertices+2];
    const z = coordinates[index*numberVertices+1];

    return [x, y, z];
}

function getNormalsByIndex(normals: number[], index: number) {
    const numberVertices = 3;

    const normalX = normals[index*numberVertices];
    const normalY = normals[index*numberVertices+1];
    const normalZ = normals[index*numberVertices+2];

    return [normalX, normalY, normalZ];
}

function getMaterialByLayerType(
    layerType: LayerType, 
    color: THREE.Vector3, 
    opacity: number,
    isVisible?: boolean
): THREE.MeshMatcapMaterial | THREE.MeshPhongMaterial | THREE.ShaderMaterial {
    switch(layerType) {
        case LayerType.Surface: {
            surfaceShaderMaterial = setFloorShaderMaterial(color, opacity);

            return surfaceShaderMaterial;
        }
        case LayerType.Water: {
            waterShaderMaterial = setFloorShaderMaterial(color, opacity);

            return waterShaderMaterial;
        }
        case LayerType.Park: {
            parkShaderMaterial = setFloorShaderMaterial(color, opacity);

            return parkShaderMaterial;
        }
        case LayerType.Building: {
            if(isVisible) {
                visibleBuildingShaderMaterial = setBuildingShaderMaterial(color, opacity, isVisible);
                return visibleBuildingShaderMaterial;
            }

            invisibleBuildingShaderMaterial = setBuildingShaderMaterial(color, 0.2, isVisible);
            return invisibleBuildingShaderMaterial;
        }
    }
}

export function getAllMaterials(): THREE.ShaderMaterial[] {
    return [
        visibleBuildingShaderMaterial,
        invisibleBuildingShaderMaterial,
        parkShaderMaterial,
        waterShaderMaterial,
        surfaceShaderMaterial
    ];
}

export function setShaderMaterialPosition(updatedCenter: THREE.Vector3): void {
    if(visibleBuildingShaderMaterial.uniforms) {
        visibleBuildingShaderMaterial.uniforms.center.value = updatedCenter;
    }
    if(invisibleBuildingShaderMaterial.uniforms) {
        invisibleBuildingShaderMaterial.uniforms.center.value = updatedCenter;
    }
}

function setUniform(colorVector: THREE.Vector3, opacity: number, isVisible?: boolean) {
    const lightUniforms = THREE.UniformsUtils.merge([
        THREE.UniformsLib['lights'],
        { diffuse: { type: 'c', value: new THREE.Color(0xffffff) } }
    ]);
    const uniforms = {
        scale: {
            value: new THREE.Vector3(1.0, 1.0, 1.0),
        },
        center: {
            value: new THREE.Vector3(0.0, 0.0, 0.0),
        },
        radius: {
            value: 500.0,
        },
        opacity: {
            value: opacity,
        },
        color: {
            value: colorVector,
        },
        diameter: {
            value: 5000,
        },
        isVisible: {
            value: isVisible
        },
        isRamaOn: {
            value: false
        },
        ...lightUniforms
    };

    return uniforms;
}

export function setBuildingShaderMaterial(colorVector: THREE.Vector3, opacity: number, isVisible?: boolean) {
    const shaderMaterial = new THREE.ShaderMaterial( {
        uniforms: setUniform(colorVector, opacity, isVisible),
        vertexShader: _BuildingVertexShader,
        fragmentShader: _BuildingFragmentShader,
        transparent: !isVisible,
        lights: true,
        side: THREE.DoubleSide,
        depthWrite: isVisible
    } );

    return shaderMaterial;
}

export function setFloorShaderMaterial(colorVector: THREE.Vector3, opacity: number): THREE.ShaderMaterial {
    const floorShaderMaterial = new THREE.ShaderMaterial( {
        uniforms: setUniform(colorVector, opacity),
        vertexShader: _BuildingVertexShader,
        fragmentShader: _FloorFragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        // lights: true
    } );
    return floorShaderMaterial;
}