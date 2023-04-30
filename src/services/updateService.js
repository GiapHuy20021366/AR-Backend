import fs from "fs";
import path from "path";

const readJSONFile = () => {
  const file = fs.readFileSync(
    path.resolve(__dirname, "../public/json/views.json")
  );
  return file;
};

const getNewVersion = (views) => {
  const curViews = JSON.parse(readJSONFile());
  if (!views) {
    return curViews;
  }
  if (
    +views.version === +curViews.version &&
    views.description === curViews.description
  ) {
    return false;
  }

  return curViews;
};

module.exports = {
  readJSONFile,
  getNewVersion,
};
