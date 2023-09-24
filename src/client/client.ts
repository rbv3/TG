import * as THREE from 'three';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Database, getDatabase, push, ref } from 'firebase/database';
import { PointerLockControls } from './controls/PointerLockControls';
import cityJson from '../../public/data/manhattan.json';
// import cityJson from '../../public/data/city.json';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';
import { ActivityMap, City, LayerType } from './types';
import { setAllMaterialGUI, setControlsGUI } from './gui/guiHelper';
import { getAllMaterials, renderLayer, setShaderMaterialLookAt, setShaderMaterialPosition } from './render/renderHelper';
import { AMORTIZE_SPEED_X, AMORTIZE_SPEED_Y, AMORTIZE_SPEED_Z, KeyCode, MAX_HEIGHT, MIN_HEIGHT, POSITION_GOALS } from './constants';

const instructions = document.getElementById('instructions') as HTMLElement;
const blocker = document.getElementById('blocker') as HTMLElement;
const endGame = document.getElementById('end-game') as HTMLElement;

const userId = `user${new Date().getTime()}`;

let isPaused = true;

const activityMap: ActivityMap = {
    [KeyCode.W]: 0,
    [KeyCode.A]: 0,
    [KeyCode.S]: 0,
    [KeyCode.D]: 0,
    [KeyCode.Z]: 0,
    [KeyCode.X]: 0,
    'mouse': 0,
    'height0to50': 0,
    'height51to100': 0,
    'height101to150': 0,
    'timeElapsed': 0
};

let startTime = performance.now();

const goals = [...Object.keys(POSITION_GOALS)];
let currentIndex = 0;
let currentGoal = goals[currentIndex];
const distanceOffset = 10;
let hasGameEnded = false;

const city = cityJson as City;
const {surface , buildings, water, parks} = city;

console.log({buildings, surface, water, parks});

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

const reusableVector = new THREE.Vector3();

let app: FirebaseApp;
let database: Database;

initializeFirebase();

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

// setInterval(() => {
//     console.log('----------');
//     for(const prop in activityMap) {
//         console.log(`${prop}: ${activityMap[prop]}`);
//     }
//     console.log('----------');
// }, 500);

function animate() {
    requestAnimationFrame(animate);

    const {x, z} = controls.getObject().position;

    if(!hasGameEnded) {
        const hasReachedDestiny = checkDestiny(x, z);
        if(hasReachedDestiny) {
            activityMap.timeElapsed = performance.now() - startTime;
            startTime = performance.now();
            
            console.log('YHAAAAAAAAA, you finished: ', currentGoal);
            console.log('----Activiy Map------');
            for(const prop in activityMap) {
                console.log(`${prop}: ${activityMap[prop as keyof ActivityMap]}`);
            }
            console.log('-----FINISHED-----');
            writeUserData({quest: currentIndex, data: activityMap});
            resetActivityMap();
            resetPosition();

            currentIndex += 1;
            if(currentIndex >= goals.length) {
                hasGameEnded = true;
                isPaused = true;
                setEndGameScreen();
            } else {
                currentGoal = goals[currentIndex];
            }
        }
    }


    setShaderMaterialPosition(controls.getObject().position);
    setShaderMaterialLookAt(camera.getWorldDirection(reusableVector));

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
    
    if(!isPaused) {
        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );
        controls.getObject().position.y = getUpdatedY(delta);
    }

    setHeightActivity(controls.getObject().position.y, delta);

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
    camera.lookAt(0, MIN_HEIGHT, 10);

    setControlledCameraEvents();

    renderer = new THREE.WebGLRenderer({logarithmicDepthBuffer: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor( 0xdefbff, 1 );
    renderer.sortObjects = false;
  
    document.body.appendChild(renderer.domElement);
    
    controls = new PointerLockControls(camera, document.body);
    controls.isLocked = false;

    scene.add( controls.getObject() );
    
    window.addEventListener('resize', onWindowResize, false);
}

function setGUI() {
    const gui = new GUI();
    
    setAllMaterialGUI(gui, getAllMaterials());    
    setControlsGUI(gui, controls);
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

function onKeyPress(event: KeyboardEvent, isPressed: boolean) {
    console.log(event.code)
    switch ( event.code ) {
        case KeyCode.ARROW_UP:
        case KeyCode.W:
            moveForward = isPressed;
            setKeyPressActivity(event.code);
            break;

        case KeyCode.ARROW_LEFT:
        case KeyCode.A:
            moveLeft = isPressed;
            setKeyPressActivity(event.code);
            break;

        case KeyCode.ARROW_DOWN:
        case KeyCode.S:
            moveBackward = isPressed;
            setKeyPressActivity(event.code);
            break;

        case KeyCode.ARROW_RIGHT:
        case KeyCode.D:
            moveRight = isPressed;
            setKeyPressActivity(event.code);
            break;
        
        case KeyCode.Z:
            moveUpwards = isPressed;
            setKeyPressActivity(event.code);
            break;
        
        case KeyCode.X:
            moveDownwards = isPressed;
            setKeyPressActivity(event.code);
            break;
        
        case KeyCode.ESC:
            console.log("ESC was clicked")
            if(!isPressed) {
                togglePauseMode();
            }
            break;
    }
}

function onMousePress(event: MouseEvent, isPressed: boolean): void {
    if(!isPaused) {
        if(isPressed) controls.isLocked = true;
        else {
            activityMap.mouse++;
            controls.isLocked = false;
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function setEndGameScreen() {
    blocker.style.display = 'block';
    endGame.style.display = '';
}

function togglePauseMode() {
    isPaused= !isPaused;
    
    if(isPaused) {
        blocker.style.display = 'block';
        instructions.style.display = '';
        endGame.style.display = 'none';

    } else {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
        endGame.style.display = 'none';
    }
}

function setKeyPressActivity(keyCode: string) {
    if(isPaused) return;
    activityMap[keyCode as keyof ActivityMap]++;
}

function setHeightActivity(height: number, delta: number) {
    if(isPaused) return;

    if(height > 0 && height <= 50) {
        activityMap.height0to50 += delta;
    }
    else if(height > 50 && height <= 100) {
        activityMap.height51to100 += delta;
    }
    else if(height > 100 && height <=150) {
        activityMap.height101to150 += delta;
    }
}

function resetActivityMap() {
    for(const prop in activityMap) {
        activityMap[prop as keyof ActivityMap] = 0;
    }
}

function resetPosition() {
    controls.getObject().position.x = 0;
    controls.getObject().position.z = 0;
    controls.getObject().position.y = MIN_HEIGHT;
}

function checkDestiny(x: number, z: number) {
    const negativeOffsetX = Math.floor(x) - distanceOffset;
    const positiveOffsetX = Math.floor(x) + distanceOffset;
    const negativeOffsetZ = Math.floor(z) - distanceOffset;
    const positiveOffsetZ = Math.floor(z) + distanceOffset;
    const xGoal = POSITION_GOALS[currentGoal][0];
    const zGoal = POSITION_GOALS[currentGoal][1];
    return (xGoal >= negativeOffsetX && xGoal <= positiveOffsetX) && (zGoal >= negativeOffsetZ && zGoal <= positiveOffsetZ);
}

function initializeFirebase() {
    const firebaseConfig = {
        apiKey: 'AIzaSyDrEbFiI82SIiP-5WjVjc74GUCg3qbNOmw',
        authDomain: 'three-js-city.firebaseapp.com',
        projectId: 'three-js-city',
        storageBucket: 'three-js-city.appspot.com',
        messagingSenderId: '425293153476',
        appId: '1:425293153476:web:39351a18126bead9c33591',
        measurementId: 'G-82128GESDG'
    };
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
}
function writeUserData({quest, data}: {quest: number, data: ActivityMap}): void {
    push(ref(database, 'quest' + quest), {...data, userId});
}