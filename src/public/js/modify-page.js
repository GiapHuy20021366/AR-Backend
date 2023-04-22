import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

import { syncLights, syncModels, syncOptions } from "./embed-component.js";

let configJSON;
const getConfigJSON = async () => {
  const res = await fetch("/json/views.json");
  configJSON = await res.json();
};
await getConfigJSON();

const gltfLoader = async (url) => {
  const loader = new GLTFLoader();
  const model = await loader.loadAsync(url);
  return model;
};

class DownloadManager {
  constructor() {
    this.downloaded = {};
  }

  async download(url, name, loader = gltfLoader) {
    if (this.downloaded[name]) {
      return this.downloaded[name];
    }
    const model = await loader(url);
    this.download[name] = model;
    return model;
  }
}

class World {
  constructor(container) {
    this.container = container;
    this.marker = null;
    this.models = {};
    this.lights = {};
    this.groups = {};
    this.options = {
      backgroundColor: 0xffffff,
    };
    this.constraints = {}; // Only constraints between model and box helpers

    // downloader
    this.downloader = new DownloadManager();

    // Renderer
    this.renderer = new THREE.WebGLRenderer();
    const { clientWidth, clientHeight } = container;
    this.renderer.setSize(clientWidth, clientHeight);

    this.container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();
    this.setBackgroundColor(this.options.backgroundColor);

    // Clock for animation
    this.clock = new THREE.Clock();
    this.mixers = {};
    this.actions = {};

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 0, 10);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.addEventListener("change", () => {
      this.renderer.render(this.scene, this.camera);
    });
    this.controls.update();

    // AxesHelper
    this.axesHelper = new THREE.AxesHelper(150);
    this.showAxes = false;
    this.showAxesHelper(true);
  }

  async loadFrom(json) {
    const { version, models, marker, groups, files } = json;
    this.version = version;
    groups.forEach((groupName) => {
      this.addGroup(groupName);
    });

    Promise.all(
      models.map(async (modelProperty) => {
        const { id, name, group, position, rotation, scale, visible } =
          modelProperty;
        const downloadUrl = files[name].downloadUrl;
        const model = await this.downloader.download(downloadUrl, name);
        this.addModel(model, id, position, rotation, scale, visible, group);
      })
    );
  }

  setBackgroundColor(color = 0xffffff, sync = true) {
    this.scene.background = new THREE.Color(color);
    this.options.backgroundColor = color;
    sync && syncOptions(this);
  }

  showAxesHelper(show) {
    if (show) {
      this.addToScene(this.axesHelper);
      this.showAxes = true;
    }
    if (!show && this.showAxes) {
      this.scene.remove(this.axesHelper);
      this.showAxes = false;
    }
  }

  // groups is an array of names
  initGroups(groups) {
    groups.forEach((name) => {
      this.addGroup(name);
    });
  }

  // Group name and model object
  addModelToGroup(group, model) {}

  addGroup(groupName) {
    const group = new THREE.Group();
    this.groups[groupName] = group;
    this.scene.add(group);
  }

  addModel(
    model,
    key,
    position = null,
    rotation = null,
    scale = null,
    visible = true,
    groupName = null
  ) {
    // const model = await loader(url);
    const modelScene = model.scene.clone();
    const animation = model.animations[0];
    const mixer = new THREE.AnimationMixer(modelScene);
    const action = mixer.clipAction(animation);
    this.mixers[key] = mixer;
    this.actions[key] = action;
    this.models[key] = modelScene;
    action.play();
    // Set properties
    position && modelScene.position.set(...position);
    rotation && modelScene.rotation.set(...rotation);
    scale && modelScene.scale.set(...scale);
    modelScene.visible = visible;

    // Add follow group
    if (groupName) {
      !this.groups[groupName] && this.addGroup(groupName);
      const group = this.groups[groupName];
      group.add(modelScene);
      modelScene.belongGroup = {
        name: groupName,
        ref: group,
      };
    } else {
      this.addToScene(modelScene);
    }

    syncModels(this);
  }

  addLight(light, key, position = null) {
    this.lights[key] = light;
    if (position) {
      light.position.set(...position);
    }
    this.scene.add(light);
    syncLights(this);
  }

  addToScene(component) {
    this.scene.add(component);
  }

  getModelSize(key) {
    const model = this.models[key];
    const scene = model.scene;
    const boundingBox = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
  }

  getModel(key) {
    return this.models[key];
  }

  play() {
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = this.clock.getDelta();
      this.controls.update();
      Object.values(this.constraints).forEach((constraint) => {
        constraint.update();
      });
      Object.values(this.mixers).forEach((mixer) => {
        mixer.update(delta);
      });
      this.renderer.render(this.scene, this.camera);
      //   this.renderer.setClearColor(this.scene.background);
    };
    animate();
  }
}

// Light
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
hemiLight.position.set(1, 1, 1);

// Light
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(1, 1, 1);

const getPlane = (width = 100, height = 100) => {
  const planeGeometry = new THREE.PlaneGeometry(width, height, 1, 1);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xe1e5ea,
    opacity: 0.5,
    transparent: true,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  return plane;
};

const getBoxHelper = (modelScene) => {
  const group = new THREE.Group();
  // Tạo hộp bao quanh đối tượng
  const box = new THREE.Box3().setFromObject(modelScene);
  const boxHelper = new THREE.BoxHelper(modelScene, 0xffff00);
  group.add(boxHelper);

  // Tạo 8 dấu tại các điểm đầu mút của hộp
  const cornerSpheres = [];
  const cornerPositions = [
    box.min.clone(),
    box.min.clone().set(box.max.x, box.min.y, box.min.z),
    box.min.clone().set(box.min.x, box.max.y, box.min.z),
    box.min.clone().set(box.min.x, box.min.y, box.max.z),
    box.max.clone().set(box.min.x, box.max.y, box.max.z),
    box.max.clone().set(box.max.x, box.min.y, box.max.z),
    box.max.clone().set(box.max.x, box.max.y, box.min.z),
    box.max.clone(),
  ];

  for (let i = 0; i < cornerPositions.length; i++) {
    const sphereGeometry = new THREE.SphereGeometry(0.05);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.copy(cornerPositions[i]);
    cornerSpheres.push(sphere);
    group.add(sphere);
  }
  return group;
};

async function main() {
  const container = document.querySelector("#canvas-container");
  const world = new World(container);
  world.addToScene(getPlane());
  world.addLight(dirLight, "dirLight");
  world.addLight(hemiLight, "hemiLight");
  world.loadFrom(configJSON);
  world.play();
}

main().catch((err) => {
  console.error(err);
});
