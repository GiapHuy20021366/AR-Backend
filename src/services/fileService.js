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

const deleteFile = async (name) => {
  if (!GFS.gfs) {
    return null;
  }
  const file = await findFileOnDB(name);
  if (!file) {
    return null;
  }
  await GFS.gfs.delete(file._id);
};

const insertFileInfo = (file) => {
  // Get origin name before Date index
  const { filename } = file;
  let idx = filename.lastIndexOf("-");
  idx = idx != -1 ? idx : filename.length;
  file.originalName = filename.slice(idx + 1);
  // Insert access view link
  file.viewUrl = `${process.env.SERVER_URL}:${process.env.PORT}/view/model/${filename}`;
  file.downloadUrl = `${process.env.SERVER_URL}:${process.env.PORT}/api/download/${filename}`;
  file.deleteUrl = `${process.env.SERVER_URL}:${process.env.PORT}/api/model/${filename}`;
  file.uploadDate = new Date(file.uploadDate).toLocaleString();
};

module.exports = {
  findFileOnDB,
  fileAllFilesOnDB,
  deleteFile,
  insertFileInfo,
};
