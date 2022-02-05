import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import cityJson from '../../public/data/manhattan.json';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';
import { City, CityLayer, LayerType } from './types';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';

const city = cityJson as City;
const {surface , buildings, water, parks} = city;

console.log({buildings});
console.log({water});
console.log({surface});

const scene = new THREE.Scene();

let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let directionalLight: THREE.DirectionalLight;
let surfaceMaterial: THREE.MeshMatcapMaterial;
let parkMaterial: THREE.MeshPhongMaterial;
let waterMaterial: THREE.MeshPhongMaterial;
let buildingMaterial: THREE.MeshPhongMaterial;

const stats = Stats();
document.body.appendChild(stats.dom);
setInitialScene();

const group = new THREE.Group();
group.add(new THREE.AxesHelper(70));
group.add(new THREE.AxesHelper(-71));

scene.add(group);

// createInitialSurface(group);

renderLayer(surface, group, LayerType.Surface);
renderLayer(water, group, LayerType.Water);
renderLayer(parks, group, LayerType.Park);
renderLayer(buildings, group, LayerType.Building);

window.addEventListener('resize', onWindowResize, false);

setGUI();

animate();

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function animate() {
    requestAnimationFrame(animate);

    controls.update();
    render();
    stats.update();
}

function render() {
    renderer.render(scene, camera);
}

function setInitialScene() {
    directionalLight = new THREE.DirectionalLight( 0xffffff, 0.6);
    directionalLight.position.set(3000, 3000, 500);
    const helper = new THREE.DirectionalLightHelper( directionalLight, 500 );
    scene.add(directionalLight);
    scene.add( helper );
    const light = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(light);
    
    // const fog = new THREE.Fog(0xcecece, 1, 4000);
    // scene.fog = fog;

    camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 4000);
    camera.position.z = 200;
    camera.position.y = 1000;
    camera.up.set(0, 0, 1);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor( 0xdefbff, 1 );
    // renderer.setClearColor( 0x000000, 1 );
    document.body.appendChild(renderer.domElement);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 1;
    controls.maxDistance = 2000;
    
    window.addEventListener('resize', onWindowResize, false);
}

function setGUI() {
    const gui = new GUI();
    const lightFolder = gui.addFolder('Directional Light');
    lightFolder.add(directionalLight.position, 'x', -3000, 3000);
    lightFolder.add(directionalLight.position, 'y', -3000, 3000);
    lightFolder.add(directionalLight.position, 'z', 0, 500);
    // lightFolder.open();

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
}

function renderLayer(layer: CityLayer, group: THREE.Group, type: LayerType): void {
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

function getMaterialByLayerType(layer: LayerType, color: THREE.Color, opacity: number): THREE.MeshMatcapMaterial | THREE.MeshPhongMaterial {
    switch(layer) {
        case LayerType.Surface: {
            surfaceMaterial = new THREE.MeshMatcapMaterial( { color } );
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

function handleColorChange( color: THREE.Color ) {
    return function ( value: number) {
        color.setHex( value );
    };
}