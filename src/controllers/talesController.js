const taleModel = require("../models/tale");

const talesController = {
  index(req, res) {
    let tales = taleModel.getAllTales();
    tales.sort((a, b) => b.views - a.views);
    res.render("index", { tales });
  },

  content(req, res) {
    const tales = taleModel.getAllTales();
    tales.sort((a, b) => a.name.localeCompare(b.name));

    let grouped = {};

    tales.forEach((tale) => {
      const firstLetter = tale.name.charAt(0).toUpperCase();

      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(tale);
    });

    const sortedLetters = Object.keys(grouped).sort();

    res.render("content", { grouped, sortedLetters });
  },

  async getTale(req, res) {
    const taleName = req.params.talesname;
    const tale = taleModel.getTaleByName(taleName);
    if (!tale) {
      const text = "Упс... ваша казка не знайдена. Спробуйте знайти іншу казку";
      res.render("pageError", { text });
    } else {
      const paragraphs = await taleModel.getTaleById(taleName);
      res.render("tales", { tale, paragraphs, session: req.session });
    }
  },

  checkTale(req, res) {
    const talesname = req.body.talesname;
    if (talesname === "") {
      return res.redirect("/");
    } else {
      return res.redirect("/tales/" + talesname);
    }
  },

  getAllTales(req, res) {
    const allTales = taleModel.getAllTales();
    res.render("search", { tales: allTales });
  },
  markAsRead(req, res) {
    const taleName = req.params.talesname;
    const tale = taleModel.getTaleByName(taleName);

    if (tale) {
      taleModel
        .postNewViewtale(tale.id)
        .then(() => {
          if (req.session.user) {
            const username = req.session.user.username;
            taleModel.markTaleAsRead(username, taleName);
            if (!req.session.user.read_tales.includes(taleName)) {
              req.session.user.read_tales.push(taleName);
              req.session.user.unread_tales = taleModel.getUnreadTales(
                req.session.user.read_tales
              );
            }
          }
          res.status(200).json({
            success: true,
            message: "Позначено як прочитано",
            views: tale.views,
          });
        })
        .catch((err) => {
          console.error("Error updating tale view count:", err);
        });
    } else {
      res.status(404).json({ success: false, message: "Казку не знайдено" });
    }
  },

  rateTale(req, res) {
    let data = req.body;
    let taleName = data.taleName;
    taleName = taleName.toLowerCase();
    let rating = data.rate;
    rating = parseInt(rating, 10);
    let tale = taleModel.getTaleByName(taleName);

    if (tale) {
      taleModel.postNewRate(taleName, rating);
      res.status(200).json({
        success: true,
        message: "Рейтинг оновлено",
        rate: tale.rate,
      });
    } else {
      res.status(404).json({ success: false, message: "Казку не знайдено" });
    }
  },

  saveTale(req, res) {
    if (!req.session.user) {
      return res
        .status(401)
        .json({ success: false, message: "Користувач не авторизований" });
    }
    const taleName = req.params.talesname;
    const username = req.session.user.username;
    taleModel.saveTaleForUser(username, taleName);
    taleModel.postNewSavetale(taleName, (err) => {
      if (err) {
        console.error("Error saving tale:", err);
      }
    });
    if (!req.session.user.saved_tales.includes(taleName)) {
      req.session.user.saved_tales.push(taleName);
    }
    res.status(200).json({ success: true, message: "Казка збережена" });
  },
};

module.exports = talesController;
