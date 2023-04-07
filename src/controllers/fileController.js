import { fileService } from "../services/index";
import GFS from "../config/storage";
require("dotenv").config();

const fileUploadView = (req, res) => {
  return res.render("upload-models.ejs", {});
};

const fileUpLoadAction = (req, res, next) => {
  const { file, body } = req;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  const { middlewareInf } = req;
  const { filename } = middlewareInf;
  return res.redirect(
    `${process.env.SERVER_URL}:${process.env.PORT}/view/${filename}`
  );
};

const fileView = async (req, res, next) => {
  const name = req?.params?.name;

  try {
    const file = await fileService.findFileOnDB(name.toLowerCase());
    if (!file) {
      return res.status(404).send("File not found");
    }

    return res.render("model-view.ejs", {
      modelUrl: `${process.env.SERVER_URL}:${
        process.env.PORT
      }/download/${file.filename.toLowerCase()}`,
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
  const files = await fileService.fileAllFilesOnDB(name);
  return res.render("files-view.ejs", {
    files,
  });
};

module.exports = {
  fileUploadView,
  fileUpLoadAction,
  fileView,
  fileDownload,
  fileList,
};
