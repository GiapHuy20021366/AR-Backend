import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

import {
  syncLights,
  syncModels,
  syncOptions,
  syncGroups,
  addElementToGroup,
  removeElementFromGroup,
  syncImport,
  syncAnchor,
  syncExport,
} from "./embed-component.js";

(function () {
  var script = document.createElement("script");
  script.onload = function () {
    var stats = new Stats();
    document.body.appendChild(stats.dom);
    requestAnimationFrame(function loop() {
      stats.update();
      requestAnimationFrame(loop);
    });
  };
  script.src = "https://mrdoob.github.io/stats.js/build/stats.min.js";
  document.head.appendChild(script);
})();

const { Vector3, EventDispatcher } = THREE;

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

const cloneGltf = (gltf) => {
  const clone = {
    animations: gltf.animations,
    scene: gltf.scene.clone(true),
  };

  const skinnedMeshes = {};

  gltf.scene.traverse((node) => {
    if (node.isSkinnedMesh) {
      skinnedMeshes[node.name] = node;
    }
  });

  const cloneBones = {};
  const cloneSkinnedMeshes = {};

  clone.scene.traverse((node) => {
    if (node.isBone) {
      cloneBones[node.name] = node;
    }

    if (node.isSkinnedMesh) {
      cloneSkinnedMeshes[node.name] = node;
    }
  });

  for (let name in skinnedMeshes) {
    const skinnedMesh = skinnedMeshes[name];
    const skeleton = skinnedMesh.skeleton;
    const cloneSkinnedMesh = cloneSkinnedMeshes[name];

    const orderedCloneBones = [];

    for (let i = 0; i < skeleton.bones.length; ++i) {
      const cloneBone = cloneBones[skeleton.bones[i].name];
      orderedCloneBones.push(cloneBone);
    }

    cloneSkinnedMesh.bind(
      new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses),
      cloneSkinnedMesh.matrixWorld
    );
  }

  return clone;
};

const getBoxHelper = (modelScene) => {
  const group = new THREE.Group();
  const box = new THREE.Box3().setFromObject(modelScene);
  const boxHelper = new THREE.BoxHelper(modelScene, 0xffff00);
  group.add(boxHelper);

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

const getQR = () => {
  var planeGeometry = new THREE.PlaneGeometry(0.1, 0.1, 1, 1);
  var planeMaterial = new THREE.MeshBasicMaterial({ map: null });
  var textureLoader = new THREE.TextureLoader();
  textureLoader.load("/images/QRCode.png", function (texture) {
    planeMaterial.map = texture;
    planeMaterial.needsUpdate = true;
  });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.set(0, 0, 0);
  return plane;
};

class DownloadManager {
  constructor() {
    this.downloaded = {};
    this.urls = {};
  }

  async download(url, name, loader = gltfLoader) {
    if (this.downloaded[name]) {
      const clone = cloneGltf(this.downloaded[name]);
      return clone;
    }
    const model = await loader(url);
    this.downloaded[name] = model;
    this.urls[name] = url;
    return cloneGltf(model);
  }
}

class CustomGroup {
  constructor(name) {
    this.name = name;
    this.models = {};
    this.listeners = {};

    this.position = new Vector3();
    this.rotation = new Vector3();
    this.scale = new Vector3(1, 1, 1);
    this.visible = true;

    this.initListeners();
  }

  addEventListener(type, listener) {
    this.listeners[type] = listener;
  }

  dispatchEvent(event) {
    const type = event.type;
    this.executeListener(type, event);
  }

  initListeners() {
    this.listeners["move"] = (event) => {
      const { oldValue, newValue } = event;
      const delta = newValue.clone().sub(oldValue);
      Object.values(this.models).forEach((model) => {
        model.position.x += delta.x;
        model.position.y += delta.y;
        model.position.z += delta.z;
      });
    };
    this.listeners["rotate"] = (event) => {
      const { oldValue, newValue } = event;
      const delta = newValue.clone().sub(oldValue);
      Object.values(this.models).forEach((model) => {
        model.rotation.x += delta.x;
        model.rotation.y += delta.y;
        model.rotation.z += delta.z;
      });
    };
    this.listeners["resize"] = (event) => {
      const { oldValue, newValue } = event;
      Object.values(this.models).forEach((model) => {
        if (newValue.x <= 0) {
          model.scale.x = 0;
        } else if (model.scale.x <= 0 && newValue.x > 0) {
          model.scale.x = newValue.x;
        } else {
          const mX = newValue.x / oldValue.x;
          model.scale.x *= mX;
        }
        if (newValue.y <= 0) {
          model.scale.y = 0;
        } else if (model.scale.y <= 0 && newValue.y > 0) {
          model.scale.y = newValue.y;
        } else {
          const mY = newValue.y / oldValue.y;
          model.scale.y *= mY;
        }
        if (newValue.z <= 0) {
          model.scale.z = 0;
        } else if (model.scale.z <= 0 && newValue.z > 0) {
          model.scale.z = newValue.z;
        } else {
          const mZ = newValue.z / oldValue.z;
          model.scale.z *= mZ;
        }
      });
    };
    this.listeners["visible"] = (event) => {
      Object.values(this.models).forEach((model) => {
        model.visible = event.visible;
      });
    };
  }

  refreshGroup() {
    this.groupModel = new THREE.Group();
    Object.values(this.models).forEach((model) => {
      this.groupModel.add(model.clone());
    });
    return this.groupModel;
  }

  add(model) {
    this.models[model.modelName] = model;
  }

  remove(model) {
    if (this.models[model.modelName]) {
      delete this.models[model.modelName];
    }
  }

  executeListener(type, event) {
    const listener = this.listeners[type];
    listener && listener(event);
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
    this.anchor = null;
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

    // Sync Imports
    syncImport(this);
    syncExport(this);
  }

  async loadFrom(json) {
    const { version, webModels, appModels, marker, groups, files } = json;
    this.version = version;
    groups.forEach((groupName) => {
      this.addGroup(groupName);
    });

    marker.rotation[0] = (marker.rotation[0] / 180) * Math.PI;
    marker.rotation[1] = (marker.rotation[1] / 180) * Math.PI;
    marker.rotation[2] = (marker.rotation[2] / 180) * Math.PI;
    this.addAnchor(marker);

    Promise.all(
      webModels.map(async (modelProperty) => {
        const { id, name, group, position, rotation, scale, visible } =
          modelProperty;
        const downloadUrl = files[name].downloadUrl;
        const model = await this.downloader.download(downloadUrl, name);
        this.addModel(
          model,
          id,
          name,
          position,
          rotation,
          scale,
          visible,
          group
        );
      })
    );
  }

  addAnchor(anchorProperties) {
    const { position, rotation, scale, visible } = anchorProperties;
    const anchor = getQR();
    position && anchor.position.set(...position);
    rotation && anchor.rotation.set(...rotation);
    scale && anchor.scale.set(...scale);
    anchor.visible = visible;
    this.anchor = anchor;
    this.addToScene(anchor);
    syncAnchor(this);
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
  addModelToGroup(groupName, model) {
    !this.groups[groupName] && this.addGroup(groupName);
    const group = this.groups[groupName];
    model.belongGroup = {
      name: groupName,
      ref: group,
    };
    this.groups[groupName].add(model);
    addElementToGroup(group, model);
  }

  removeModelFromGroup(groupName, model) {
    const group = this.groups[groupName];
    if (group) {
      model.belongGroup = null;
      group.remove(model);
      removeElementFromGroup(group, model);
    }
  }

  addGroup(groupName) {
    // const group = new THREE.Group();
    const group = new CustomGroup(groupName);
    group.groupName = groupName;
    this.groups[groupName] = group;
    group.storeState = {
      position: group.position.clone(),
      rotation: group.rotation.clone(),
      scale: group.scale.clone(),
      visible: group.visible,
    };
    // Box Helper
    group.isShowBoxHelper = false;
    group.addEventListener("change", () => {
      const oldBoxHelper = group.boxHelper;
      oldBoxHelper && this.scene.remove(oldBoxHelper);
      if (group.isShowBoxHelper) {
        group.boxHelper = getBoxHelper(group.refreshGroup());
        this.addToScene(group.boxHelper);
      }
    });
    group.setShowBoxHelper = (show) => {
      group.isShowBoxHelper = show;
      const oldBoxHelper = group.boxHelper;
      oldBoxHelper && this.scene.remove(oldBoxHelper);
      if (group.isShowBoxHelper) {
        group.boxHelper = getBoxHelper(group.refreshGroup());
        this.addToScene(group.boxHelper);
      }
    };
    syncGroups(this);
  }

  addModel(
    model,
    key,
    nameRef,
    position = null,
    rotation = null,
    scale = null,
    visible = true,
    groupName = null
  ) {
    // const model = await loader(url);
    // const modelScene = model.scene.clone();
    const modelScene = model.scene;
    const animation = model.animations[0];
    const mixer = new THREE.AnimationMixer(modelScene);
    if (animation) {
      const action = mixer.clipAction(animation);
      this.actions[key] = action;
      action.play();
    }

    this.mixers[key] = mixer;
    this.models[key] = modelScene;
    // Set properties
    position && modelScene.position.set(...position);
    rotation && modelScene.rotation.set(...rotation);
    scale && modelScene.scale.set(...scale);
    modelScene.visible = visible;
    modelScene.modelName = key;
    modelScene.nameRef = nameRef;

    // Add follow group

    groupName && this.addModelToGroup(groupName, modelScene);

    this.addToScene(modelScene);

    modelScene.storeState = {
      position: modelScene.position.clone(),
      rotation: modelScene.rotation.clone(),
      scale: modelScene.scale.clone(),
      visible: modelScene.visible,
    };

    // Box Helper
    modelScene.isShowBoxHelper = false;
    modelScene.addEventListener("change", () => {
      const oldBoxHelper = modelScene.boxHelper;
      oldBoxHelper && this.scene.remove(oldBoxHelper);
      if (modelScene.isShowBoxHelper) {
        modelScene.boxHelper = getBoxHelper(modelScene);
        this.addToScene(modelScene.boxHelper);
      }
    });
    modelScene.setShowBoxHelper = (show) => {
      modelScene.isShowBoxHelper = show;
      const oldBoxHelper = modelScene.boxHelper;
      oldBoxHelper && this.scene.remove(oldBoxHelper);
      if (modelScene.isShowBoxHelper) {
        modelScene.boxHelper = getBoxHelper(modelScene);
        this.addToScene(modelScene.boxHelper);
      }
    };

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
      Object.values(this.models).forEach((model) => {
        const position = model.position.clone();
        const rotation = model.rotation.clone();
        const scale = model.scale.clone();
        const visible = model.visible;
        let positionChanged = false;
        let rotationChanged = false;
        let scaleChanged = false;
        let visibleChanged = false;
        if (!position.equals(model.storeState.position)) {
          positionChanged = true;
          const distanceVector = position
            .clone()
            .sub(model.storeState.position);
          model.storeState.position = position;
          model.dispatchEvent({ type: "move", distanceVector });
        }
        if (!rotation.equals(model.storeState.rotation)) {
          rotationChanged = true;
          model.storeState.rotation = rotation;
          model.dispatchEvent({ type: "rotate" });
        }
        if (!scale.equals(model.storeState.scale)) {
          scaleChanged = true;
          model.storeState.scale = scale;
          model.dispatchEvent({ type: "resize" });
        }
        if (visible != model.storeState.visible) {
          visibleChanged = true;
          model.storeState.visible = visible;
          model.dispatchEvent({ type: "visible" });
        }

        if (positionChanged || scaleChanged || rotationChanged) {
          model.dispatchEvent({ type: "change" });
        }
      });
      Object.values(this.groups).forEach((group) => {
        const position = group.position.clone();
        const rotation = group.rotation.clone();
        const scale = group.scale.clone();
        const visible = group.visible;
        let positionChanged = false;
        let rotationChanged = false;
        let scaleChanged = false;
        let visibleChanged = false;
        if (!position.equals(group.storeState.position)) {
          positionChanged = true;
          group.dispatchEvent({
            type: "move",
            oldValue: group.storeState.position,
            newValue: position,
          });
          group.storeState.position = position;
        }
        if (!rotation.equals(group.storeState.rotation)) {
          rotationChanged = true;
          group.dispatchEvent({
            type: "rotate",
            oldValue: group.storeState.rotation,
            newValue: rotation,
          });
          group.storeState.rotation = rotation;
        }
        if (!scale.equals(group.storeState.scale)) {
          scaleChanged = true;
          group.dispatchEvent({
            type: "resize",
            oldValue: group.storeState.scale,
            newValue: scale,
          });
          group.storeState.scale = scale;
        }
        if (visible != group.storeState.visible) {
          visibleChanged = true;
          group.storeState.visible = visible;
          group.dispatchEvent({ type: "visible", visible: visible });
        }

        if (positionChanged || scaleChanged || rotationChanged) {
          group.dispatchEvent({ type: "change" });
        }
      });
      this.renderer.render(this.scene, this.camera);
      //   this.renderer.setClearColor(this.scene.background);
    };
    animate();
  }

  transformModels() {
    const appModels = [];
    // Transform to app show

    Object.entries(this.models).forEach(([modelName, model]) => {
      const cloneModel = model.clone();
      cloneModel.position.sub(this.anchor.position);
      const rotation = cloneModel.rotation.clone().toArray();
      rotation[0] = (rotation[0] * 180) / Math.PI;
      rotation[1] = (rotation[1] * 180) / Math.PI;
      rotation[2] = (rotation[2] * 180) / Math.PI;
      const modelDescription = {
        id: modelName,
        name: model.nameRef,
        group: model?.belongGroup?.name,
        position: cloneModel.position.clone().toArray(),
        rotation: rotation,
        scale: cloneModel.scale.clone().toArray(),
        visible: model.visible,
      };
      appModels.push(modelDescription);
    });
    return appModels;
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

async function main() {
  const container = document.querySelector("#canvas-container");
  const world = new World(container);
  world.addToScene(getPlane());
  world.addLight(dirLight, "dirLight");
  world.addLight(hemiLight, "hemiLight");
  world.loadFrom(configJSON);
  // world.addToScene(getQR());
  world.play();
}

main().catch((err) => {
  console.error(err);
});
