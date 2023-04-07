import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
require("dotenv").config();
import conn from "./connectDB";
import mongoose from "mongoose";
// const Grid = require("gridfs-stream");

let gfs;
const GFS = {
  gfs: gfs,
};
conn.once("open", () => {
  GFS.gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: process.env.COLLECTION,
  });
  // GFS.gfs = Grid(conn.db, mongoose.mongo);
  // GFS.gfs.collection(process.env.COLLECTION);
  // gfs = Grid(conn.db, mongoose.mongo);
  // gfs.collection(process.env.COLLECTION);
  //   console.log("GFS ", gfs);
});

export const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  file: (req, file) => {
    const filename = file.originalname.toLowerCase();
    // This is a middleware, then pass file name into req
    const middlewareInf = {
      filename,
    };
    req.middlewareInf = middlewareInf;
    return new Promise((resolve, reject) => {
      const fileInfo = {
        filename: filename,
        bucketName: process.env.COLLECTION,
      };
      resolve(fileInfo);
    });
  },
});

export const upload = multer({
  storage: storage,
});

export default GFS;
