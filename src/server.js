import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRouters from "./route/web";
import cors from "cors";
import http from "http";
import methodOverride from "method-override";
import fs from "fs";
import https from "https";
import path from "path";

require("dotenv").config();

const app = express();
const server = http.createServer(app);

// config app
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: true }));

viewEngine(app);
initWebRouters(app);

require("greenlock-express")
  .init({
    packageRoot: path.resolve(__dirname, "../"),
    configDir: "./greenlock.d",

    // contact for security and critical bug notices
    maintainerEmail: "huygiapboy@gmail.com",

    // whether or not to run at cloudscale
    cluster: false,
  })
  // Serves on 80 and 443
  // Get's SSL certificates magically!
  .serve(app);

// const httpServer = http.createServer(app);
// httpServer.listen(80, () => {
//   console.log("http server listening on port 80");
// });

// const httpsServer = https.createServer(
//   {
//     key: fs.readFileSync(path.resolve(__dirname, "./RSA/key.pem")),
//     cert: fs.readFileSync(path.resolve(__dirname, "./RSA/cert.pem")),
//   },
//   app
// );
// httpsServer.listen(443, () => {
//   console.log("https server listening on port 443");
// });

// connectDB();

// let port = process.env.PORT || 2002;

// server.listen(port, () => {
//   console.log("Running on the port: " + port);
// });
