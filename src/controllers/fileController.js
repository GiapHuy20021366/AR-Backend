import GFS from "../config/storage";

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
  return res.send("File uploaded");
};

const fileView = async (req, res, next) => {
  const name = req?.params?.name;
  console.log(name);
  const { gfs } = GFS;

  if (!name) {
    return res.status(403).send("Error - No file found");
  }

  if (!gfs) {
    return res.status(500).send("Internal Server failed");
  }

  const files = await gfs.find({ filename: name }).toArray();
  if (!files || files.length === 0) {
    return res.status(403).send("Find not found");
  }
  const file = files[0];
  console.log(file);
  const downStream = gfs.openDownloadStream(file._id);
  const pipe = downStream.pipe(res);
  console.log(pipe);
  return res.render("model-view.ejs", {
    data: pipe,
  });
};

module.exports = {
  fileUploadView,
  fileUpLoadAction,
  fileView,
};
