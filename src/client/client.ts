import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import cityJson from '../../public/data/manhattan.json';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';
import { City, LayerType } from './types';
import { setAllMaterialGUI, setDirectionalLightGUI } from './gui/guiHelper';
import { getAllMaterials, renderLayer } from './render/renderHelper';

const city = cityJson as City;
const {surface , buildings, water, parks} = city;

const scene = new THREE.Scene();

let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let directionalLight: THREE.DirectionalLight;

const stats = Stats();
document.body.appendChild(stats.dom);

setInitialScene();

const group = new THREE.Group();
group.add(new THREE.AxesHelper(1000));
group.add(new THREE.AxesHelper(-1000));

scene.add(group);

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
    directionalLight.castShadow = true;
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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 1;
    controls.maxDistance = 2000;
    
    window.addEventListener('resize', onWindowResize, false);
}

function setGUI() {
    const gui = new GUI();
    
    setAllMaterialGUI(gui, getAllMaterials());
    
    setDirectionalLightGUI(gui, directionalLight);
}
