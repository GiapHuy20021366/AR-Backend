const loadFrameToViewModel = (event) => {
  const viewUrl = event.target.getAttribute("viewUrl");
  const container = document.getElementById("view-frame");
  if (container) {
    container.src = viewUrl;
  }
};
