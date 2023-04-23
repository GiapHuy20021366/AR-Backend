import express from "express";
import {
  homeController,
  fileController,
  modifyController,
} from "./../controllers/index";
import { upload } from "../config/storage";

const router = express.Router();

const initWebRouters = (app) => {
  router.get("/", homeController.home);
  router.get("/upload", fileController.fileUploadView);
  router.post(
    "/upload",
    upload.single("myModel"),
    fileController.fileUpLoadAction
  );
  router.get("/view/model/:name", fileController.fileView);
  router.get("/api/download/:name", fileController.fileDownload);
  router.get("/list", fileController.fileList);
  router.delete("/api/model/:name", fileController.fileDelete);
  router.get("/page", modifyController.modifyPage);
  router.get("/files", fileController.getAllFiles);
  router.post("/json", fileController.saveViews);
  return app.use("/", router);
};

module.exports = initWebRouters;
