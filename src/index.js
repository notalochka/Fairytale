const express = require("express");
const homeController = require("./controllers/homeController");
const talesController = require("./controllers/talesController");
const session = require("express-session");

const app = express();
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));
app.use(express.static("photo"));

app.use(
  session({
    secret: "my_secret_tales",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.get("/", talesController.index);
app.get("/content", talesController.content);
app.get("/userLogin", homeController.userLogin);
app.get("/logout", homeController.logout);
app.get("/userpage", homeController.userPage);

app.get("/tales/:talesname", talesController.getTale);
app.post("/check_tales", talesController.checkTale);
app.post("/tales/:talesname/mark-as-read", talesController.markAsRead);
app.get("/tales", talesController.getAllTales);
app.post("/tales/submit_rating", talesController.rateTale);
app.post("/tales/:talesname/save", talesController.saveTale);

app.post("/check_user", homeController.checkUser);
const PORT = 3300;

app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`);
});
