import * as THREE from 'three';
import { PointerLockControls } from './controls/PointerLockControls';
import cityJson from '../../public/data/manhattan.json';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';
import { City, LayerType } from './types';
import { setAllMaterialGUI, setDirectionalLightGUI } from './gui/guiHelper';
import { getAllMaterials, renderLayer } from './render/renderHelper';


const city = cityJson as City;
const {surface , buildings, water, parks} = city;

console.log({buildings, water});

const scene = new THREE.Scene();

let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: PointerLockControls;
let directionalLight: THREE.DirectionalLight;

let prevTime = performance.now();
const direction = new THREE.Vector3();
const velocity = new THREE.Vector3();
 

let moveRight = false;
let moveLeft = false;
let moveForward = false;
let moveBackward = false;

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
    console.log({camera});
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();

    const delta = ( time - prevTime ) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.y -= velocity.y * 10.0 * delta;

    direction.x = Number( moveRight ) - Number( moveLeft );
    direction.y = Number( moveForward ) - Number( moveBackward );
    direction.normalize();

    if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;
    if ( moveForward || moveBackward ) velocity.y -= direction.y * 400.0 * delta;

    
    controls.moveRight( - velocity.x * delta );
    controls.moveForward( - velocity.y * delta );

    prevTime = time;

    render();
    stats.update();
}

function render() {
    renderer.render(scene, camera);
}

function setInitialScene() {
    directionalLight = new THREE.DirectionalLight( 0xffffff, 0.6);
    directionalLight.position.set(3000, 500, 3000);
    directionalLight.castShadow = true;
    const helper = new THREE.DirectionalLightHelper( directionalLight, 500 );
    scene.add(directionalLight);
    scene.add( helper );

    const light = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(light);
    
    // const fog = new THREE.Fog(0xcecece, 1, 4000);
    // scene.fog = fog;

    camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 4000);
    camera.position.z = 10;
    camera.position.x = 0;
    camera.position.y = 0;
    camera.lookAt(0, 10, 10);
    camera.up.set(0, 0, 1);

    setControlledCameraEvents();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor( 0xdefbff, 1 );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement);
    
    controls = new PointerLockControls(camera, document.body);
    controls.isLocked = true;
    scene.add( controls.getObject() );
    console.log({controls});
    
    window.addEventListener('resize', onWindowResize, false);
}

function setGUI() {
    const gui = new GUI();
    
    setAllMaterialGUI(gui, getAllMaterials());
    
    setDirectionalLightGUI(gui, directionalLight);
}

function setControlledCameraEvents() {
    document.addEventListener( 'keydown', (e) => onKeyPress(e, true) );
    document.addEventListener( 'keyup', (e) => onKeyPress(e, false) );
    document.addEventListener('mousedown', (e) => onMousePress(e, true) );
    document.addEventListener('mouseup', (e) => onMousePress(e, false) );
}


function onKeyPress(event: any, shouldMove: boolean) {
    switch ( event.code ) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = shouldMove;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = shouldMove;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = shouldMove;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = shouldMove;
            break;
    }
}

function onMousePress(event: any, isPressed: boolean): void {
    if(isPressed) controls.isLocked = true;
    else controls.isLocked = false;
}

