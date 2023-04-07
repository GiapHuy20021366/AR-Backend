import GFS from "../config/storage";

const findFileOnDB = async (name) => {
  if (!name || !GFS.gfs) {
    return null;
  }
  const files = await GFS.gfs.find({ filename: name.toLowerCase() }).toArray();
  if (!files || files.length === 0) {
    return null;
  }
  const file = files[0];
  return file;
};

const fileAllFilesOnDB = async () => {
  if (!GFS.gfs) {
    return null;
  }
  const files = await GFS.gfs.find().toArray();
  return files;
};

module.exports = {
  findFileOnDB,
  fileAllFilesOnDB,
};
