const worldRefs = {
  models: {},
  lights: {},
  world: null,
  groups: {},
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

      const formContainer = document.getElementById("Form-Node");
      const lightExampleElement = formContainer.querySelector("._light");
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
      const modelContainer = document.getElementById(`model-${modelKey}`);
      modelContainer && modelContainer.remove();
      delete worldRefs.models[modelKey];
    }
  });

  // Insert models if not existed
  const refKeys = Object.keys(worldRefs.models);
  Object.entries(models).forEach(([key, model]) => {
    if (!refKeys.includes(key)) {
      // Insert to ref
      worldRefs.models[key] = model;

      const formContainer = document.getElementById("Form-Node");
      const modelExampleElement = formContainer.querySelector("._model");
      const modelsContainer = document.getElementById("models");
      const modelContainer = modelExampleElement.cloneNode(true);
      modelContainer.id = `model-${key}`;
      modelsContainer.appendChild(modelContainer);

      const modelHeader = modelContainer.querySelector("._model-header");
      modelHeader.innerHTML = key;

      // sync groups
      const groups = world.groups;
      const belongGroup = model.belongGroup;
      const groupsSelect = modelContainer.querySelector("._model-group-values");
      groupsSelect.id = `options-groups-${key}`;
      Object.keys(groups).forEach((groupName) => {
        const option = document.createElement("option");
        option.text = groupName;
        option.value = groupName;
        option.id = `$option-${key}-${groupName}`;
        // console.log(option.id);
        if (belongGroup && belongGroup.name === groupName) {
          option.selected = "selected";
        }
        // console.log(option);
        groupsSelect.add(option);
      });

      // Add event change group
      groupsSelect.addEventListener("change", (event) => {
        const belongGroup = model.belongGroup;
        belongGroup && world.removeModelFromGroup(belongGroup.ref.name, model);
        const newGroupName = event.target.value;
        // console.log(event.target.value);
        if (newGroupName !== "") {
          world.addModelToGroup(newGroupName, model);
        }
      });

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

      // Box Helper Sync
      const boxHelper = modelContainer.querySelector(
        "._model-box-helper-value"
      );
      boxHelper.checked = model.isShowBoxHelper;
      boxHelper.addEventListener("change", () => {
        model.setShowBoxHelper(boxHelper.checked);
      });

      // Listen changes
      model.addEventListener("move", (event) => {
        // Update position
        positionX.value = model.position.x;
        positionY.value = model.position.y;
        positionZ.value = model.position.z;
      });

      model.addEventListener("resize", (event) => {
        // Update scale
        scaleX.value = model.scale.x;
        scaleY.value = model.scale.y;
        scaleZ.value = model.scale.z;
      });
      model.addEventListener("rotate", (event) => {
        // Update rotation
        rotationX.value = model.rotation.x;
        rotationY.value = model.rotation.y;
        rotationZ.value = model.rotation.z;
      });
      model.addEventListener("visible", (event) => {
        // Update visible
        visible.checked = model.visible;
      });

      // Delete Action
      modelContainer
        .querySelector("._model-delete")
        .addEventListener("click", () => {
          if (window.confirm("Are you sure to delete this model?")) {
            if (model.boxHelper) {
              world.scene.remove(model.boxHelper);
              const belongGroupName = model.belongGroup?.name;
              belongGroupName &&
                world.removeModelFromGroup(belongGroupName, model);
            }
            delete world.mixers[model.modelName];
            delete world.actions[model.modelName];
            delete world.models[model.modelName];
            world.scene.remove(model);
            modelContainer.remove();
            Object.keys(world.groups).forEach((groupName) => {
              const option = document.getElementById(
                `elements-${groupName}-${model.modelName}`
              );
              // console.log(`elements-${groupName}-${model.modelName}`);
              // console.log(option);
              option && option.remove();
            });
            syncModels(world);
            // console.log("Model Deleted");
          }
        });
    }
  });
};

export const syncGroups = (world) => {
  worldRefs.world = world;

  const groups = world.groups;
  const keys = Object.keys(groups);
  // Reject groups not in world
  Object.keys(worldRefs.groups).forEach((groupKey) => {
    if (!keys.includes(groupKey)) {
      document.getElementById(`group-${groupKey}`).remove();
      delete worldRefs.groups[groupKey];
    }
  });

  // Insert groups if not existed
  const refKeys = Object.keys(worldRefs.groups);
  Object.entries(groups).forEach(([key, group]) => {
    if (!refKeys.includes(key)) {
      // Insert to ref
      worldRefs.groups[key] = group;

      const formContainer = document.getElementById("Form-Node");
      const groupExampleElement = formContainer.querySelector("._group");
      const groupsContainer = document.getElementById("groups");
      const groupContainer = groupExampleElement.cloneNode(true);
      groupContainer.id = `group-${key}`;
      groupsContainer.appendChild(groupContainer);

      const groupHeader = groupContainer.querySelector("._group-header");
      groupHeader.innerHTML = key;

      // List element Sync
      const elements = groupContainer.querySelector("._group-model-values");
      Object.values(group.models).forEach((model) => {
        const option = document.createComment("option");
        const modelName = model.modelName;
        option.id = `elements-${key}-${modelName}`;
        option.value = modelName;
        option.text = modelName;
        elements.add(option);
      });

      // Position sync
      const positionX = groupContainer.querySelector(
        "._group-position-x-value"
      );
      positionX.value = group.position.x;
      const positionY = groupContainer.querySelector(
        "._group-position-y-value"
      );
      positionY.value = group.position.y;
      const positionZ = groupContainer.querySelector(
        "._group-position-z-value"
      );
      positionZ.value = group.position.z;

      positionX.addEventListener("change", (event) => {
        group.position.x = parseFloat(event.target.value);
      });
      positionY.addEventListener("change", (event) => {
        group.position.y = parseFloat(event.target.value);
      });
      positionZ.addEventListener("change", (event) => {
        group.position.z = parseFloat(event.target.value);
      });

      // Rotation sync
      const rotationX = groupContainer.querySelector(
        "._group-rotation-x-value"
      );
      rotationX.value = group.rotation.x;
      const rotationY = groupContainer.querySelector(
        "._group-rotation-y-value"
      );
      rotationY.value = group.rotation.y;
      const rotationZ = groupContainer.querySelector(
        "._group-rotation-z-value"
      );
      rotationZ.value = group.rotation.z;

      rotationX.addEventListener("change", (event) => {
        group.rotation.x = parseFloat(event.target.value);
        // group.rotateOnX(parseFloat(event.target.value));
      });
      rotationY.addEventListener("change", (event) => {
        group.rotation.y = parseFloat(event.target.value);
        // group.rotate([0, 1, 0], parseFloat(event.target.value));
      });
      rotationZ.addEventListener("change", (event) => {
        group.rotation.z = parseFloat(event.target.value);
        // group.rotate([0, 0, 1], parseFloat(event.target.value));
      });

      // Scale sync
      const scaleX = groupContainer.querySelector("._group-scale-x-value");
      scaleX.value = group.scale.x;
      const scaleY = groupContainer.querySelector("._group-scale-y-value");
      scaleY.value = group.scale.y;
      const scaleZ = groupContainer.querySelector("._group-scale-z-value");
      scaleZ.value = group.scale.z;

      scaleX.addEventListener("change", (event) => {
        group.scale.x = parseFloat(event.target.value);
      });
      scaleY.addEventListener("change", (event) => {
        group.scale.y = parseFloat(event.target.value);
      });
      scaleZ.addEventListener("change", (event) => {
        group.scale.z = parseFloat(event.target.value);
      });

      // Visible sync
      const visible = groupContainer.querySelector("._group-visible-value");
      visible.checked = group.visible;
      visible.addEventListener("change", (event) => {
        // console.log(event.target.value);
        group.visible = event.target.checked;
      });

      // Box Helper Sync
      const boxHelper = groupContainer.querySelector(
        "._group-box-helper-value"
      );
      boxHelper.checked = group.isShowBoxHelper;
      boxHelper.addEventListener("change", () => {
        group.setShowBoxHelper(boxHelper.checked);
      });

      // Listen changes
      // @ No support
      // group.addEventListener("move", (event) => {
      //   // Update position
      //   positionX.value = group.position.x;
      //   positionY.value = group.position.y;
      //   positionZ.value = group.position.z;
      // });

      // group.addEventListener("resize", (event) => {
      //   // Update scale
      //   scaleX.value = group.scale.x;
      //   scaleY.value = group.scale.y;
      //   scaleZ.value = group.scale.z;
      // });
      // group.addEventListener("rotate", (event) => {
      //   // Update rotation
      //   rotationX.value = group.rotation.x;
      //   rotationY.value = group.rotation.y;
      //   rotationZ.value = group.rotation.z;
      // });
      // group.addEventListener("visible", (event) => {
      //   // Update visible
      //   visible.checked = group.visible;
      // });
    }
  });
};

export const addElementToGroup = (group, model) => {
  const groupContainer = document.getElementById(`group-${group.groupName}`);
  const elements = groupContainer.querySelector("._group-model-values");
  const option = document.createElement("option");
  option.value = model.modelName;
  option.text = model.modelName;
  option.id = `elements-${group.groupName}-${model.modelName}`;
  elements.add(option);
};

export const removeElementFromGroup = (group, model) => {
  // const groupContainer = document.getElementById(`group-${group.groupName}`);
  const option = document.getElementById(
    `elements-${group.groupName}-${model.modelName}`
  );
  option && option.remove();
  if (!option) {
    window.alert("error");
  }
};

export const syncImport = async (world) => {
  worldRefs.world = world;
  const origin = window.location.origin;
  const reload = () => {
    fetch(`${origin}/files`)
      .then((res) => res.json())
      .then((result) => {
        const options = document.getElementById("import-model-options");
        while (options.firstChild) {
          options.removeChild(options.lastChild);
        }
        result.forEach((model) => {
          const { downloadUrl, filename, originalName, viewUrl } = model;
          // console.log(downloadUrl);
          const option = document.createElement("option");
          option.value = originalName;
          option.text = originalName;
          option.setAttribute("name", filename);
          option.setAttribute("originalName", originalName);
          option.setAttribute("downloadUrl", downloadUrl);
          // console.log(option.getAttribute("downloadUrl"));
          // option.attributes.downloadUrl = downloadUrl;
          options.add(option);
        });
      });
  };
  reload();
  const randomKey = (prefix) => {
    let key = prefix;
    while (world.models[key]) {
      const rand = Math.floor(Math.random() * 10000);
      key = `${prefix}-${rand}`;
    }
    return key;
  };
  document
    .getElementById("btn-refresh-import")
    .addEventListener("click", () => {
      reload();
    });
  document
    .getElementById("import-model-action")
    .addEventListener("click", async (event) => {
      const options = document.getElementById("import-model-options");
      const selected = options.options[options.selectedIndex];
      const prefix = selected.getAttribute("originalName");
      const name = selected.getAttribute("name");
      const downloadUrl = selected.getAttribute("downloadUrl");
      const id = randomKey(prefix);

      // console.log(name, downloadUrl, key);
      const model = await world.downloader.download(downloadUrl, name);
      // console.log(Object.keys(worldRefs.models));
      world.addModel(model, id, name);
      // console.log("New model Added");
      // console.log(id);
      // console.log(Object.keys(world.models));
    });

  document
    .getElementById("import-group-action")
    .addEventListener("click", () => {
      const input = document.getElementById("import-group-input");
      const groupName = input.value.trim();
      if (groupName === "") {
        window.alert("Cannot empty!");
        return;
      }
      if (world.groups[groupName]) {
        window.alert("Group Name already existed!");
        return;
      }
      // Create group
      world.addGroup(groupName);
      Object.keys(world.models).forEach((modelName) => {
        const groupSelect = document.getElementById(
          `options-groups-${modelName}`
        );
        const option = document.createElement("option");
        option.value = groupName;
        option.text = groupName;
        option.id = `$option-${modelName}-${groupName}`;
        groupSelect.appendChild(option);
      });
    });
};

export const syncAnchor = (world) => {
  worldRefs.world = world;
  const anchor = world.anchor;

  const anchorContainer = document.getElementById("anchor");
  // Position sync
  const positionX = anchorContainer.querySelector(".anchor-position-x-value");
  positionX.value = anchor.position.x;
  const positionY = anchorContainer.querySelector(".anchor-position-y-value");
  positionY.value = anchor.position.y;
  const positionZ = anchorContainer.querySelector(".anchor-position-z-value");
  positionZ.value = anchor.position.z;

  positionX.addEventListener("change", (event) => {
    anchor.position.x = parseFloat(event.target.value);
  });
  positionY.addEventListener("change", (event) => {
    anchor.position.y = parseFloat(event.target.value);
  });
  positionZ.addEventListener("change", (event) => {
    anchor.position.z = parseFloat(event.target.value);
  });

  // Rotation sync
  const rotationX = anchorContainer.querySelector(".anchor-rotation-x-value");
  rotationX.value = anchor.rotation.x;
  const rotationY = anchorContainer.querySelector(".anchor-rotation-y-value");
  rotationY.value = anchor.rotation.y;
  const rotationZ = anchorContainer.querySelector(".anchor-rotation-z-value");
  rotationZ.value = anchor.rotation.z;

  rotationX.addEventListener("change", (event) => {
    anchor.rotation.x = parseFloat(event.target.value);
  });
  rotationY.addEventListener("change", (event) => {
    anchor.rotation.y = parseFloat(event.target.value);
  });
  rotationZ.addEventListener("change", (event) => {
    anchor.rotation.z = parseFloat(event.target.value);
  });

  // Scale sync
  const scaleX = anchorContainer.querySelector(".anchor-scale-x-value");
  scaleX.value = anchor.scale.x;
  const scaleY = anchorContainer.querySelector(".anchor-scale-y-value");
  scaleY.value = anchor.scale.y;
  const scaleZ = anchorContainer.querySelector(".anchor-scale-z-value");
  scaleZ.value = anchor.scale.z;

  scaleX.addEventListener("change", (event) => {
    anchor.scale.x = parseFloat(event.target.value);
  });
  scaleY.addEventListener("change", (event) => {
    anchor.scale.y = parseFloat(event.target.value);
  });
  scaleZ.addEventListener("change", (event) => {
    anchor.scale.z = parseFloat(event.target.value);
  });

  // Visible sync
  const visible = anchorContainer.querySelector(".anchor-visible-value");
  visible.checked = anchor.visible;
  visible.addEventListener("change", (event) => {
    // console.log(event.target.value);
    anchor.visible = event.target.checked;
  });
};

export const syncExport = (world) => {
  worldRefs.world = world;
  const getViews = () => {
    const inputElement = document.getElementById("export-result-input");
    const description = inputElement.value;
    if (description === "") {
      window.alert("Description can not empty!");
      return;
    }

    const json = {
      version: world.version + 1,
      description: description,
      marker: {
        position: world.anchor.position.clone().toArray(),
        rotation: world.anchor.rotation.clone().toArray(),
        scale: world.anchor.scale.clone().toArray(),
        visible: world.anchor.visible,
      },
      webModels: [],
      appModels: world.transformModels(),
      groups: Object.keys(world.groups),
      files: {},
    };

    Object.entries(world.downloader.urls).forEach(([name, downloadUrl]) => {
      json.files[name] = {
        name,
        downloadUrl,
      };
    });

    Object.entries(world.models).forEach(([modelName, model]) => {
      const modelDescription = {
        id: modelName,
        name: model.nameRef,
        group: model?.belongGroup?.name,
        position: model.position.clone().toArray(),
        rotation: model.rotation.clone().toArray(),
        scale: model.scale.clone().toArray(),
        visible: model.visible,
      };
      json.webModels.push(modelDescription);
    });

    console.log(JSON.parse(JSON.stringify(json)));
    // window.alert("This feature is implementing");
    return json;
  };
  document
    .getElementById("export-result-action")
    .addEventListener("click", () => {
      // transform models
      const json = getViews();
      var dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(json));
      var dlAnchorElem = document.getElementById("downloadAnchorElem");
      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute(
        "download",
        `views-version-${json.version}.json`
      );
      dlAnchorElem.click();
    });

  document
    .getElementById("save-to-server")
    .addEventListener("click", async () => {
      const json = getViews();
      if (!json) {
        return;
      }
      await fetch(`${window.location.origin}/json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(json),
      })
        .then((res) => res.json())
        .then((result) => {
          window.alert("Success");
          world.version = json.version;
        })
        .catch((err) => {
          window.alert(err);
        });
    });
};
