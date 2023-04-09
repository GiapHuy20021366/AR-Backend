require("dotenv").config();

const home = (req, res) => {
  return res.redirect(`${process.env.SERVER_URL}:${process.env.PORT}/list`);
};

module.exports = {
  home,
};
