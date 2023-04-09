import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
require("dotenv").config();
import conn from "./connectDB";
import mongoose from "mongoose";

let gfs;
const GFS = {
  gfs: gfs,
};
conn.once("open", () => {
  GFS.gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: process.env.MODELS_COLLECTION,
  });
});

export const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  file: (req, file) => {
    console.log(file);
    const filename =
      `${file.originalname.toLowerCase()}-${Date.now()}`.replaceAll(" ", "");
    // This is a middleware, then pass file name into req
    const middlewareInf = {
      filename,
    };
    req.middlewareInf = middlewareInf;
    return new Promise((resolve, reject) => {
      const fileInfo = {
        filename: filename,
        bucketName: process.env.MODELS_COLLECTION,
      };
      resolve(fileInfo);
    });
  },
});

export const upload = multer({
  storage: storage,
});

export default GFS;
