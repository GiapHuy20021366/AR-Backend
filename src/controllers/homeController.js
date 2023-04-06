const home = (req, res) => {
  return res.render("home.ejs", {});
};

module.exports = {
  home,
};
