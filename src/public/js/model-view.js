import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const clock = new THREE.Clock();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
// camera.position.z = 10;
camera.position.set(0, 0, 10);

// Add Light
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
hemiLight.position.set(1, 1, 1);
scene.add(hemiLight);

// Add Light
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(0, 0, 10);
scene.add(dirLight);

const axesHelper = new THREE.AxesHelper(50);
scene.add(axesHelper);

// Resize window event
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = width.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix;
});

// setup controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener("change", () => {
  renderer.render(scene, camera);
});
controls.update();

async function loadDataModel(url) {
  const loader = new GLTFLoader();
  const data = await loader.loadAsync(url);
  return data;
}

class World {
  constructor(container, url) {
    this.container = container;
    this.url = url;
    this.container.appendChild(renderer.domElement);
  }

  async init() {
    const model = await loadDataModel(this.url);

    const modelScene = model.scene;
    // modelScene.position.set(0, 0, 0);

    console.log(model);
    const animation = model.animations[0];
    const mixer = new THREE.AnimationMixer(modelScene);
    const action = mixer.clipAction(animation);
    action.play();

    scene.add(modelScene);
    renderer.render(scene, camera);

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      controls.update();
      //   console.log(mixer);
      mixer.update(delta);
      console.log("asjkdk");

      renderer.render(scene, camera);
      renderer.setClearColor(scene.background);
    };
    animate();
  }

  //   start() {
  //     console.log("Log", this.mixer);
  //     animate(this.mixer.update);
  //   }
}

async function main() {
  const container = document.querySelector("#canvas-container");
  const world = new World(container, modelUrl);
  await world.init();
  //   world.start();
}

main().catch((err) => {
  console.error(err);
});
