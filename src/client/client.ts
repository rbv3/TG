import * as THREE from 'three';
import { PointerLockControls } from './controls/PointerLockControls';
import cityJson from '../../public/data/manhattan.json';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';
import { City, LayerType } from './types';
import { setAllMaterialGUI, setDirectionalLightGUI } from './gui/guiHelper';
import { getAllMaterials, renderLayer, setShaderMaterialPosition } from './render/renderHelper';
import { AMORTIZE_SPEED_X, AMORTIZE_SPEED_Y, AMORTIZE_SPEED_Z, KeyCode, MAX_HEIGHT, MIN_HEIGHT } from './constants';


const city = cityJson as City;
const {surface , buildings, water, parks} = city;

console.log({buildings, surface});

const scene = new THREE.Scene();

let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: PointerLockControls;
let directionalLight: THREE.DirectionalLight;
let oppositeDirectionalLight: THREE.DirectionalLight;

let prevTime = performance.now();
const direction = new THREE.Vector3();
const velocity = new THREE.Vector3();

let moveRight = false;
let moveLeft = false;
let moveForward = false;
let moveBackward = false;
let moveUpwards = false;
let moveDownwards = false;

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
renderLayer(buildings, group, LayerType.Building, false);
renderLayer(buildings, group, LayerType.Building, true);

window.addEventListener('resize', onWindowResize, false);

setGUI();

animate();

function animate() {
    requestAnimationFrame(animate);

    setShaderMaterialPosition(controls.getObject().position);

    const time = performance.now();

    const delta = ( time - prevTime ) / 1000;

    velocity.x -= velocity.x * AMORTIZE_SPEED_X * delta;
    velocity.y -= velocity.y * AMORTIZE_SPEED_Y* delta;
    velocity.z -= velocity.z * AMORTIZE_SPEED_Z * delta;

    direction.x = Number( moveRight ) - Number( moveLeft );
    direction.z = Number( moveForward ) - Number( moveBackward );
    direction.y = Number( moveUpwards ) - Number( moveDownwards );
    direction.normalize();

    
    if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;
    if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
    if ( moveUpwards || moveDownwards ) velocity.y -= direction.y * 400.0 * delta;
    
    controls.moveRight( - velocity.x * delta );
    controls.moveForward( - velocity.z * delta );
    controls.getObject().position.y = getUpdatedY(delta);

    prevTime = time;

    render();
    stats.update();
}

function render() {
    renderer.render(scene, camera);
}

function setInitialScene() {
    directionalLight = new THREE.DirectionalLight( 0xffffff, 0.4);
    directionalLight.position.set(3000, 3000, 3000);
    const helper = new THREE.DirectionalLightHelper( directionalLight, 500 );
    scene.add(directionalLight);
    scene.add( helper );

    oppositeDirectionalLight = new THREE.DirectionalLight( 0xffffff, 0.3);
    oppositeDirectionalLight.position.set(-3000, -3000, 3000);
    const oppositeHelper = new THREE.DirectionalLightHelper( oppositeDirectionalLight, 500 );
    scene.add(oppositeDirectionalLight);
    scene.add( oppositeHelper );

    camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 4000);
    camera.position.x = 0;
    camera.position.y = MIN_HEIGHT;
    camera.position.z = 0;
    camera.lookAt(10, 0, 10);

    setControlledCameraEvents();

    renderer = new THREE.WebGLRenderer({logarithmicDepthBuffer: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor( 0xdefbff, 1 );
    renderer.sortObjects = false;

    document.body.appendChild(renderer.domElement);
    
    controls = new PointerLockControls(camera, document.body);
    controls.isLocked = true;
    scene.add( controls.getObject() );
    
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

function getUpdatedY(delta: number): number {
    const previousY = controls.getObject().position.y;
    const updatedY = previousY + ( -velocity.y * delta );
    
    return Math.min(Math.max(updatedY, MIN_HEIGHT), MAX_HEIGHT);
}

function onKeyPress(event: KeyboardEvent, shouldMove: boolean) {
    switch ( event.code ) {
        case KeyCode.ARROW_UP:
        case KeyCode.W:
            moveForward = shouldMove;
            break;

        case KeyCode.ARROW_LEFT:
        case KeyCode.A:
            moveLeft = shouldMove;
            break;

        case KeyCode.ARROW_DOWN:
        case KeyCode.S:
            moveBackward = shouldMove;
            break;

        case KeyCode.ARROW_RIGHT:
        case KeyCode.D:
            moveRight = shouldMove;
            break;
        
        case KeyCode.Z:
            moveUpwards = shouldMove;
            break;
        
        case KeyCode.X:
            moveDownwards = shouldMove;
            break;
    }
}

function onMousePress(event: MouseEvent, isPressed: boolean): void {
    if(isPressed) controls.isLocked = true;
    else controls.isLocked = false;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

