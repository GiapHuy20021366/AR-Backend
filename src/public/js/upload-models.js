var dropZone = document.getElementById("drop-zone");
dropZone.addEventListener("dragover", handleDragOver, false);
dropZone.addEventListener("drop", handleFileSelect, false);

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = "copy";
}

function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();

  var files = evt.dataTransfer.files; // FileList object.

  // Only process one file.
  var file = files[0];
  var fileType = file.type;
  console.log("file Type: " + fileType + ".");

  if (!file.name.endsWith(".glb")) {
    alert("Invalid file format. Please upload a GLB file.");
    return;
  }

  // Update the input field with the selected file.
  var inputFile = document.getElementById("file");
  inputFile.files = files;

  // Optional: Display the file name on the drop zone.
  var dropZone = document.getElementById("drop-zone");
  var fileName = document.createElement("p");
  fileName.textContent = file.name;
  var existingP = dropZone.querySelector("p");
  if (existingP) {
    dropZone.removeChild(existingP);
  }
  dropZone.appendChild(fileName);
}
var inputFile = document.getElementById("file");
inputFile.addEventListener("change", function () {
  var fileName = this.value.split("\\").pop();
  document.getElementById("file-name").innerHTML = fileName;
});
