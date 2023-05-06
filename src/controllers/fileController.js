import { fileService, updateService } from "../services/index";
import GFS from "../config/storage";
import fs from "fs";
import path from "path";
require("dotenv").config();

const fileUploadView = (req, res) => {
  return res.render("upload-models.ejs", {});
};

const fileUpLoadAction = (req, res, next) => {
  const { file, body } = req;
  if (!file) {
    return res.status(400).send("Please upload a file");
  }
  const { middlewareInf } = req;
  const { filename } = middlewareInf;
  return res.redirect(`${process.env.SERVER_URL}/view/model/${filename}`);
};

const fileView = async (req, res, next) => {
  const name = req?.params?.name;

  try {
    const file = await fileService.findFileOnDB(name.toLowerCase());
    if (!file) {
      return res.status(404).send("File not found");
    }
    fileService.insertFileInfo(file);
    return res.render("model-view.ejs", {
      modelUrl: `${
        process.env.SERVER_URL
      }/api/download/${file.filename.toLowerCase()}`,
      file,
    });
  } catch (error) {
    console.log(error);
  }
};

const fileDownload = async (req, res, next) => {
  const name = req?.params?.name;
  // console.log(name);
  const file = await fileService.findFileOnDB(name);
  if (!file) {
    return res.status(404).send("File not found");
  }
  // console.log(file);
  const downStream = GFS.gfs.openDownloadStream(file._id);
  return downStream.pipe(res);
};

const fileList = async (req, res) => {
  const files = await fileService.fileAllFilesOnDB();
  if (!files) {
    return res.status(500).send("Internal Server Error");
  }
  files.forEach((file) => {
    fileService.insertFileInfo(file);
  });
  return res.render("files-view.ejs", {
    files: files.reverse(),
  });
};

const fileDelete = async (req, res) => {
  const name = req?.params?.name;
  if (!name) {
    return res.status(403).send("Bad Request");
  }
  await fileService.deleteFile(name);
  return res.status(200).send("Deleted!");
};

const getAllFiles = async (req, res) => {
  const files = await fileService.fileAllFilesOnDB();
  if (!files) {
    return res.status(500).send("Internal Server Error");
  }
  files.forEach((file) => {
    fileService.insertFileInfo(file);
  });
  return res.status(200).json(files);
};

const saveViews = async (req, res) => {
  const obj = req.body;
  console.log("obj \n", obj);
  try {
    fs.writeFile(
      path.resolve(__dirname, "../public/json/views.json"),
      JSON.stringify(obj),
      (err) => {
        console.log(err);
      }
    );
    return res.status(200).json({
      message: "Success!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

const checkUpdateViews = async (req, res) => {
  let views = req.body;
  if (typeof views === "string") {
    try {
      views = JSON.parse(views);
    } catch (error) {
      return res.status(400).send("Invalid views");
    }
  }
  const ver = updateService.getNewVersion(views);
  if (ver) {
    return res.status(200).json({
      update: true,
      data: ver,
    });
  }
  return res.status(200).json({
    update: false,
    data: ver,
  });
};

module.exports = {
  fileUploadView,
  fileUpLoadAction,
  fileView,
  fileDownload,
  fileList,
  fileDelete,
  getAllFiles,
  saveViews,
  checkUpdateViews,
};
