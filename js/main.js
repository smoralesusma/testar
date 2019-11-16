import * as THREE from '../build/three.module.js';
import { GLTFLoader } from '../lib/GLTFLoader.js';

var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var markerRoot1, markerRoot2;

let mixer;

var mesh1;
var mesh2;

var Arbol;

var loader = new GLTFLoader();

initialize();
animate();

window['Arbol'] = Arbol;


function initialize() {
  scene = new THREE.Scene();

  // let ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
  // scene.add(ambientLight);

  var light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  light.position.set( 0, 20, 0 );
  scene.add( light );
  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 0, 20, -10 );
  scene.add( light );

  camera = new THREE.Camera();
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setClearColor(new THREE.Color('lightgrey'), 0)
  renderer.setSize(640, 480);
  renderer.domElement.style.position = 'absolute'
  renderer.domElement.style.top = '0px'
  renderer.domElement.style.left = '0px'
  document.body.appendChild(renderer.domElement);

  clock = new THREE.Clock();
  deltaTime = 0;
  totalTime = 0;

  ////////////////////////////////////////////////////////////
  // setup arToolkitSource
  ////////////////////////////////////////////////////////////

  arToolkitSource = new THREEx.ArToolkitSource({
    sourceType: 'webcam',
  });

  function onResize() {
    arToolkitSource.onResize()
    arToolkitSource.copySizeTo(renderer.domElement)
    if (arToolkitContext.arController !== null) {
      arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
    }
  }

  arToolkitSource.init(function onReady() {
    onResize()
  });

  // handle resize event
  window.addEventListener('resize', function () {
    onResize()
  });

  ////////////////////////////////////////////////////////////
  // setup arToolkitContext
  ////////////////////////////////////////////////////////////	

  // create atToolkitContext
  arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: 'data/camera_para.dat',
    detectionMode: 'mono'
  });

  // copy projection matrix to camera when initialization complete
  arToolkitContext.init(function onCompleted() {
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
  });

  ////////////////////////////////////////////////////////////
  // setup markerRoots
  ////////////////////////////////////////////////////////////

  // build markerControls

  //Alpina Arbol
  markerRoot1 = new THREE.Group();
  scene.add(markerRoot1);
  let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
    type: 'pattern', patternUrl: "data/StickerAlpina.patt",
  })

  Arbol = new THREE.Object3D();
  loader.load('../models/arbol/ArbolFull.glb', function (gltf) {
    const model = gltf.scene;
    Arbol.add(model);
    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });
  });
  // Arbol.position.y = 1;
  Arbol.scale.set(0.3,0.3,0.3);
  markerRoot1.add(Arbol);

  //Alpina queso
  markerRoot2 = new THREE.Group();
  scene.add(markerRoot2);
  let markerControls2 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot2, {
    type: 'pattern', patternUrl: "data/StickerQueso.patt",
  })

  let geometry2 = new THREE.CubeGeometry(1, 1, 1);
  let material2 = new THREE.MeshNormalMaterial({
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });

  mesh2 = new THREE.Mesh(geometry2, material2);
  mesh2.position.y = 0.5;

  markerRoot2.add(mesh2);
}


function update() {
  // update artoolkit on every frame
  if (arToolkitSource.ready !== false)
    arToolkitContext.update(arToolkitSource.domElement);
}


function render() {
  renderer.render(scene, camera);
}


function animate() {
  requestAnimationFrame(animate);
  deltaTime = clock.getDelta();
  totalTime += deltaTime;

  if (mixer != null) {
    mixer.update(deltaTime);
  };

  update();
  render();
}