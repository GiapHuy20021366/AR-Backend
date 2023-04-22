const modifyPage = (req, res, next) => {
  return res.render("modify-page.ejs");
};

module.exports = {
  modifyPage,
};
