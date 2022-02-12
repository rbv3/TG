import * as THREE from 'three';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { CityLayer, LayerType } from '../types';


let surfaceMaterial: THREE.MeshPhongMaterial;
let parkMaterial: THREE.MeshPhongMaterial;
let waterMaterial: THREE.MeshPhongMaterial;
let buildingMaterial: THREE.MeshPhongMaterial;
let shaderMaterial: THREE.ShaderMaterial;

const isInsideCircle = `
    float isInsideCircle(vec3 center, vec3 coordinates, float radius) {
        float a, b, x, y, distance, squaredRadius;
        a = center.x;
        b = center.y;
        x = coordinates.x;
        y = coordinates.y;

        distance = pow((x-a), 2.0) + pow((y-b), 2.0);
        squaredRadius = pow(radius, 2.0);
        
        if(distance <= squaredRadius)
            return 1.0;
        else
            return 0.0;
    }
`;

const _VS = `
    ${isInsideCircle}

    uniform vec3 center;
    uniform float radius;
    uniform vec3 scale;

    varying float isInside;
    
    void main() {
        isInside = isInsideCircle(center, position, radius);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position * scale, 1.0);
    }
`;

const _FS = `
    uniform float opacity;
    uniform vec3 color;
    
    varying float isInside;

    void main() {
        if(abs(isInside - 1.0) < 0.00001) 
            gl_FragColor = vec4(color[0], color[1], color[2], opacity);
        else 
            gl_FragColor = vec4(color[0], color[1], color[2], 1.0);
    }
`;

export function setShaderMaterial() {
    shaderMaterial = new THREE.ShaderMaterial( {
        uniforms: {
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
                value: 0.7,
            },
            color: {
                value: new THREE.Vector3(1.0, 0.0, 0.0),
            },
        },
        vertexShader: _VS,
        fragmentShader: _FS,
        transparent: true
        // lights: true
    } );
}

export function renderLayer(layer: CityLayer, group: THREE.Group, type: LayerType): void {
    setShaderMaterial();

    const triangleMeshes: THREE.BufferGeometry[] = [];

    const {coordinates, indices, color, normals} = layer;
    const [r, g, b, opacity] = color;
    
    const threeColor = new THREE.Color(r, g, b);

    drawTriangles(coordinates, indices, triangleMeshes, normals);

    const mergedMeshes = mergeBufferGeometries(triangleMeshes);
    const material = getMaterialByLayerType(type, threeColor, opacity);
    
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
    const y = coordinates[index*numberVertices+1];
    const z = coordinates[index*numberVertices+2];

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
    color: THREE.Color, 
    opacity: number
): THREE.MeshMatcapMaterial | THREE.MeshPhongMaterial | THREE.ShaderMaterial {
    switch(layerType) {
        case LayerType.Surface: {
            surfaceMaterial = new THREE.MeshPhongMaterial( { color } );
            surfaceMaterial.opacity = opacity;
            surfaceMaterial.transparent = true;
            surfaceMaterial.normalMap;
            surfaceMaterial.reflectivity = 0.1;

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
            waterMaterial.reflectivity = 0.1;

            return parkMaterial;
        }
        case LayerType.Building: {
            buildingMaterial = new THREE.MeshPhongMaterial( { color } );
            buildingMaterial.opacity = opacity;
            buildingMaterial.transparent = true;
            buildingMaterial.normalMap;
            buildingMaterial.reflectivity = 0.4;

            return shaderMaterial;
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

export function getShaderMaterial(): THREE.ShaderMaterial {
    return shaderMaterial;
}
export function setShaderMaterialPosition(updatedCenter: THREE.Vector3): void {
    shaderMaterial.uniforms.center.value = updatedCenter;
}