

const home = (req, res) => {
    return res.render("home.ejs", {})
}

const homeController = {
    home
}

export default homeController;