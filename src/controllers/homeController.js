require("dotenv").config();

const home = (req, res) => {
  return res.redirect(`${process.env.SERVER_URL}/list`);
};

module.exports = {
  home,
};
