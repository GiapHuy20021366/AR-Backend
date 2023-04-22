const worldRefs = {
  models: {},
  lights: {},
  world: null,
};

export const syncOptions = (world) => {
  worldRefs.world = world;
  // Sync background
  const optionsController = document.getElementById("options");
  const backgroundInput = optionsController.querySelector("._background-value");
  // backgroundInput.value =
  const { backgroundColor } = world.options;
  backgroundInput.value = `#${backgroundColor.toString(16)}`;
  backgroundInput.addEventListener("change", (event) => {
    const decColor = parseInt(event.target.value.replace("#", ""), 16);
    world.setBackgroundColor(decColor, false);
  });
};

export const syncLights = (world) => {
  worldRefs.world = world;

  const lights = world.lights;
  const keys = Object.keys(lights);
  // Reject lights not in world
  Object.keys(worldRefs.lights).forEach((lightKey) => {
    if (!keys.includes(lightKey)) {
      document.getElementById(`light-${lightKey}`).remove();
      delete worldRefs.lights[lightKey];
    }
  });

  // Insert lights if not existed
  const refKeys = Object.keys(worldRefs.lights);
  Object.entries(lights).forEach(([key, light]) => {
    if (!refKeys.includes(key)) {
      // Insert to ref
      worldRefs.lights[key] = light;

      const lightExampleElement = document.querySelector("._light");
      const lightsContainer = document.getElementById("lights");
      const lightContainer = lightExampleElement.cloneNode(true);
      lightContainer.id = `light-${key}`;
      lightsContainer.appendChild(lightContainer);

      const lightHeader = lightContainer.querySelector("._light-header");
      lightHeader.innerHTML = key;

      // Position sync
      const positionX = lightContainer.querySelector(
        "._light-position-x-value"
      );
      positionX.value = light.position.x;
      const positionY = lightContainer.querySelector(
        "._light-position-y-value"
      );
      positionY.value = light.position.y;
      const positionZ = lightContainer.querySelector(
        "._light-position-z-value"
      );
      positionZ.value = light.position.z;

      positionX.addEventListener("change", (event) => {
        light.position.x = parseFloat(event.target.value);
      });
      positionY.addEventListener("change", (event) => {
        light.position.y = parseFloat(event.target.value);
      });
      positionZ.addEventListener("change", (event) => {
        light.position.z = parseFloat(event.target.value);
      });

      // Visible sync
      const visible = lightContainer.querySelector("._light-visible-value");
      visible.checked = light.visible;
      visible.addEventListener("change", (event) => {
        // console.log(event.target.value);
        light.visible = event.target.checked;
      });
    }
  });
};

export const syncModels = (world) => {
  worldRefs.world = world;

  const models = world.models;
  const keys = Object.keys(models);
  // Reject models not in world
  Object.keys(worldRefs.models).forEach((modelKey) => {
    if (!keys.includes(modelKey)) {
      document.getElementById(`model-${modelKey}`).remove();
      delete worldRefs.models[modelKey];
    }
  });

  // Insert models if not existed
  const refKeys = Object.keys(worldRefs.models);
  Object.entries(models).forEach(([key, model]) => {
    if (!refKeys.includes(key)) {
      console.log("KEY ADD: ", key);
      // Insert to ref
      worldRefs.models[key] = model;

      const modelExampleElement = document.querySelector("._model");
      const modelsContainer = document.getElementById("models");
      const modelContainer = modelExampleElement.cloneNode(true);
      modelContainer.id = `model-${key}`;
      modelsContainer.appendChild(modelContainer);

      const modelHeader = modelContainer.querySelector("._model-header");
      modelHeader.innerHTML = key;

      // Position sync
      const positionX = modelContainer.querySelector(
        "._model-position-x-value"
      );
      positionX.value = model.position.x;
      const positionY = modelContainer.querySelector(
        "._model-position-y-value"
      );
      positionY.value = model.position.y;
      const positionZ = modelContainer.querySelector(
        "._model-position-z-value"
      );
      positionZ.value = model.position.z;

      positionX.addEventListener("change", (event) => {
        model.position.x = parseFloat(event.target.value);
      });
      positionY.addEventListener("change", (event) => {
        model.position.y = parseFloat(event.target.value);
      });
      positionZ.addEventListener("change", (event) => {
        model.position.z = parseFloat(event.target.value);
      });

      // Rotation sync
      const rotationX = modelContainer.querySelector(
        "._model-rotation-x-value"
      );
      rotationX.value = model.rotation.x;
      const rotationY = modelContainer.querySelector(
        "._model-rotation-y-value"
      );
      rotationY.value = model.rotation.y;
      const rotationZ = modelContainer.querySelector(
        "._model-rotation-z-value"
      );
      rotationZ.value = model.rotation.z;

      rotationX.addEventListener("change", (event) => {
        model.rotation.x = parseFloat(event.target.value);
      });
      rotationY.addEventListener("change", (event) => {
        model.rotation.y = parseFloat(event.target.value);
      });
      rotationZ.addEventListener("change", (event) => {
        model.rotation.z = parseFloat(event.target.value);
      });

      // Scale sync
      const scaleX = modelContainer.querySelector("._model-scale-x-value");
      scaleX.value = model.scale.x;
      const scaleY = modelContainer.querySelector("._model-scale-y-value");
      scaleY.value = model.scale.y;
      const scaleZ = modelContainer.querySelector("._model-scale-z-value");
      scaleZ.value = model.scale.z;

      scaleX.addEventListener("change", (event) => {
        model.scale.x = parseFloat(event.target.value);
      });
      scaleY.addEventListener("change", (event) => {
        model.scale.y = parseFloat(event.target.value);
      });
      scaleZ.addEventListener("change", (event) => {
        model.scale.z = parseFloat(event.target.value);
      });

      // Visible sync
      const visible = modelContainer.querySelector("._model-visible-value");
      visible.checked = model.visible;
      visible.addEventListener("change", (event) => {
        // console.log(event.target.value);
        model.visible = event.target.checked;
      });

      // Listen changes
      model.addEventListener("change", () => {
        // Update position
        positionX.value = model.position.x;
        positionY.value = model.position.y;
        positionZ.value = model.position.z;
        // Update rotation
        rotationX.value = model.rotation.x;
        rotationY.value = model.rotation.y;
        rotationZ.value = model.rotation.z;
        // Update scale
        scaleX.value = model.scale.x;
        scaleY.value = model.scale.y;
        scaleZ.value = model.scale.z;
        // Update visible
        visible.checked = model.visible;
      });

      // sync groups
      const groups = world.groups;
      const belongGroup = model.belongGroup;
      const groupsSelect = modelContainer.querySelector("._model-group-values");
      Object.keys(groups).forEach((groupName) => {
        const option = document.createElement("option");
        option.text = groupName;
        option.id = `$option-${key}-${groupName}`;
        if (belongGroup && belongGroup.name === groupName) {
          option.selected = "selected";
        }
        // console.log(option);
        groupsSelect.appendChild(option);
      });
    }
  });
};
