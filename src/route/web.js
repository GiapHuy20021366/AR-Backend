import express from "express";
import { homeController } from "../controllers/index";
let router = express.Router();

let initWebRouters = (app) => {
  router.get("/", homeController.home);

  return app.use("/", router);
};

module.exports = initWebRouters;
