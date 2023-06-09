import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

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
dirLight.position.set(1, 1, 1);
scene.add(dirLight);

const axesHelper = new THREE.AxesHelper(50);
scene.add(axesHelper);

// Resize window event
// window.addEventListener("resize", () => {
//   const width = window.innerWidth;
//   const height = width.innerHeight;
//   renderer.setSize(width, height);
//   camera.aspect = width / height;
//   camera.updateProjectionMatrix;
// });

// setup controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener("change", () => {
  renderer.render(scene, camera);
});
controls.update();

const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/libs/three/draco/");
dracoLoader.setDecoderConfig({ type: "js" });
gltfLoader.setDRACOLoader(dracoLoader);

async function loadDataModel(url) {
  const data = await gltfLoader.loadAsync(url);
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
    const box = new THREE.Box3();
    box.setFromObject(modelScene);
    const size = new THREE.Vector3();
    box.getSize(size);
    console.log(size);
    // modelScene.position.set(0, 0, 0);

    // console.log(model);
    const animation = model.animations[0];
    const mixer = new THREE.AnimationMixer(modelScene);
    if (animation) {
      const action = mixer.clipAction(animation);
      action.play();
    }

    scene.add(modelScene);
    renderer.render(scene, camera);

    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      controls.update();
      mixer.update(delta);

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
