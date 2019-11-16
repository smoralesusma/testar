import * as THREE from '../build/three.module.js';
import { GLTFLoader } from '../lib/GLTFLoader.js';

var objP;

var loader = new GLTFLoader();
var clock = new THREE.Clock();

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

objP = new THREE.Object3D();
let mixer;
loader.load('../models/arbol/Arbol.glb', function (gltf) {
    const model = gltf.scene;
    objP.add(model);
    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
    });
});
// objP.position.y = 1;

scene.add(objP);

let ambientLight = new THREE.AmbientLight(0xcccccc, 10);
scene.add(ambientLight);


camera.position.z = 10;

function render() {
    var delta = clock.getDelta();
    if (mixer != null) {
        mixer.update(delta);
    };
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate);
    // deltaTime = clock.getDelta();
    // totalTime += deltaTime;
    // update();
    render();
}

animate();

window['objP'] = objP;