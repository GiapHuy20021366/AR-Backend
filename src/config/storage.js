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
    return new Promise((resolve, reject) => {
      const filename = file.originalname;
      const fileInfo = {
        filename: filename.toLowerCase(),
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
