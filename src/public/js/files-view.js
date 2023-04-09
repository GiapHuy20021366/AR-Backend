const loadFrameToViewModel = (event) => {
  const viewUrl = event.target.getAttribute("viewUrl");
  const container = document.getElementById("view-frame");
  if (container) {
    container.src = viewUrl;
  }
};

const modelRef = {
  current: null,
};

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  const target = e.target;
  const contextMenu = document.querySelector(".context-wrapper");
  const isModelNameField = target.attributes.hasOwnProperty(
    "isModelName".toLowerCase()
  );
  if (isModelNameField && contextMenu) {
    const x = e.pageX;
    const y = e.pageY;
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.style.visibility = "visible";
    modelRef.current = target;
  } else if (!isModelNameField && contextMenu) {
    contextMenu.style.visibility = "hidden";
    modelRef.current = null;
  }
});

document.addEventListener("click", (e) => {
  const contextMenu = document.querySelector(".context-wrapper");
  if (contextMenu) {
    contextMenu.style.visibility = "hidden";
  }
});

// Context Menu functions
const view = () => {
  const iframe = document.getElementById("view-frame");
  if (iframe && modelRef.current) {
    const viewUrl = modelRef.current.getAttribute("viewUrl");
    iframe.src = viewUrl;
  }
};

const redirectToAddModelPage = () => {
  const iframe = document.getElementById("view-frame");
  if (iframe) {
    iframe.src = `${window.location.origin}/upload`;
  }
};

const deleteFile = async () => {
  if (modelRef.current) {
    const deleteUrl = modelRef.current.getAttribute("deleteUrl");
    const response = await fetch(deleteUrl, {
      method: "DELETE",
    });
    if (response.status === 200) {
      modelRef.current.parentNode.remove();
      modelRef.current = null;
    }
  }
};

window.addEventListener("message", (event) => {
  if (event.origin == window.location.origin && event.data.isModel) {
    const { data } = event;
    const elements = document.querySelectorAll("td.model-name");
    const notExisted = Array.from(elements).every((element) => {
      const fullName = element.getAttribute("fullName");
      return fullName && fullName != data.fullName;
    });

    if (notExisted) {
      const col1 = document.createElement("td");
      col1.onclick = (event) => loadFrameToViewModel(event);
      col1.classList.add("model-name");
      col1.setAttribute("viewUrl", data.viewUrl);
      col1.setAttribute("downloadUrl", data.downloadUrl);
      col1.setAttribute("fullName", data.fullName);
      col1.setAttribute("deleteUrl", data.deleteUrl);
      col1.setAttribute("originalName", data.originalName);
      col1.setAttribute("title", "Click to view model");
      col1.setAttribute("isModelName", true);
      col1.innerText = data.originalName;

      const col2 = document.createElement("td");
      col2.innerText = data.uploadDate;

      const col3 = document.createElement("td");
      col3.innerText = data.length;

      const row = document.createElement("tr");

      row.appendChild(col1);
      row.appendChild(col2);
      row.appendChild(col3);

      const table = document.getElementById("table-files");
      const body = table.getElementsByTagName("tbody")[0];
      const firstRow = body.firstChild;
      body.insertBefore(row, firstRow.nextSibling);
    }
  }
});
