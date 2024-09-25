const taleModel = require("../models/tale");

const homeController = {
  userLogin(req, res) {
    res.render("userLogin", { errorMessage: null });
  },

  checkUser(req, res) {
    let data = req.body;
    let username = data.name_or_email;
    let password = data.password;

    if (/\s/.test(username)) {
      res.render("userLogin", {
        errorMessage: "Ім'я користувача містить пробіли!",
      });
      return;
    }
    if (/\s/.test(password)) {
      res.render("userLogin", { errorMessage: "Пароль містить пробіли!" });
      return;
    }
    if (password.length < 8) {
      res.render("userLogin", {
        errorMessage: "Пароль має містити не меншее 8 символів!",
      });
      return;
    }
    info = taleModel.getUser(username, password);
    if (info.status === "success") {
      user = info.user;
      req.session.user = user;

      if (info.user.read_tales.length === 0) {
        user.unread_tales = taleModel.getAllTalesNames();
      }
      req.session.user = user;
      res.render("userPage", { user });
    } else {
      res.render("userLogin", {
        errorMessage: info.message,
      });
    }
  },

  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Помилка при виході");
      }
      res.redirect("/userLogin");
    });
  },
  userPage(req, res) {
    const user = req.session.user;
    res.render("userPage", { user });
  },
};

module.exports = homeController;
