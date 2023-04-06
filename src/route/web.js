import express from "express";
import { homeController, fileController } from "./../controllers/index";
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
  router.get("/view/:name", fileController.fileView);
  router.get("/download/:name", fileController.fileDownload);
  return app.use("/", router);
};

module.exports = initWebRouters;
