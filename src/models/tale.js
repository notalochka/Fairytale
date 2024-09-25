const fs1 = require("fs").promises;
const fs2 = require("fs");
const path = require("path");

let jsonPathTales = path.join(__dirname, "../data/tales.json");
const talesData = fs2.readFileSync(jsonPathTales, "utf-8");
let tales = JSON.parse(talesData);

let jsonPathUsers = path.join(__dirname, "../data/users.json");

function readUsers() {
  const UsersData = fs2.readFileSync(jsonPathUsers, "utf-8");
  return JSON.parse(UsersData);
}

function postNewSavetale(name, callback) {
  const tale = tales.find(
    (tale) => tale.name.toLowerCase() === name.toLowerCase()
  );

  if (!tale) {
    return callback(new Error("Tale not found"));
  }

  tale.saved += 1;

  fs2.writeFile(
    jsonPathTales,
    JSON.stringify(tales, null, 2),
    "utf-8",
    (err) => {
      if (err) {
        return callback(err);
      }

      callback(null);
    }
  );
}

function postNewViewtale(id) {
  return new Promise((resolve, reject) => {
    const tale = tales.find((t) => t.id === id);

    if (!tale) {
      return reject(new Error("Tale not found"));
    }

    tale.views += 1;

    fs1
      .writeFile(jsonPathTales, JSON.stringify(tales, null, 2), "utf-8")
      .then(() => resolve())
      .catch((err) => reject(err));
  });
}

module.exports = {
  getAllTales() {
    return tales;
  },

  getTaleByName(name) {
    return tales.find((tale) => tale.name.toLowerCase() === name.toLowerCase());
  },
  async getTaleById(name) {
    info = tales.find((tale) => tale.name.toLowerCase() === name.toLowerCase());
    id = info.id;
    const filePath = path.join(__dirname, "../data", `${id}.txt`);
    try {
      const content = await fs1.readFile(filePath, "utf-8");
      const paragraphs = content.split(/\n+/);
      return paragraphs;
    } catch (err) {
      console.error("Помилка при читанні файлу:", err);
      return null;
    }
  },

  postNewViewtale,
  postNewSavetale,
  postNewRate(name, newVote) {
    const tale = tales.find(
      (tale) => tale.name.toLowerCase() === name.toLowerCase()
    );
    tale.votes.push(newVote);
    const sumVotes = tale.votes.reduce((acc, val) => acc + val, 0);
    tale.rate = (sumVotes / tale.votes.length).toFixed(1);
    fs2.writeFileSync(jsonPathTales, JSON.stringify(tales, null, 2), "utf-8");
  },
  getUser(username, password) {
    let users = readUsers();
    const user = users.find((user) => user.username === username);
    if (user) {
      if (user.password === password) {
        return {
          status: "success",
          message: "Користувач увійшов успішно",
          user: user,
        };
      } else {
        return {
          status: "error",
          message: "Неправильний пароль",
        };
      }
    } else {
      const newUser = {
        id: users.length + 1,
        username: username,
        password: password,
        saved_tales: [],
        read_tales: [],
      };

      users.push(newUser);
      fs2.writeFileSync(jsonPathUsers, JSON.stringify(users, null, 2), "utf-8");

      return {
        status: "success",
        message: "Користувач створений успішно",
        user: newUser,
      };
    }
  },

  getUnreadTales(read_tales) {
    let unread_tales = tales.filter((tale) => !read_tales.includes(tale.name));
    return unread_tales.map((tale) => tale.name);
  },

  getAllTalesNames() {
    return tales.map((tale) => tale.name);
  },

  markTaleAsRead(username, taleName) {
    let users = readUsers();
    const user = users.find((user) => user.username === username);
    if (user && !user.read_tales.includes(taleName)) {
      user.read_tales.push(taleName);
      let unread_tales = tales.filter(
        (tale) => !user.read_tales.includes(tale.name)
      );
      user.unread_tales = unread_tales.map((tale) => tale.name);
      fs2.writeFileSync(jsonPathUsers, JSON.stringify(users, null, 2), "utf-8");
    }
  },
  saveTaleForUser(username, taleName) {
    let users = readUsers();
    const user = users.find((user) => user.username === username);
    if (user && !user.saved_tales.includes(taleName)) {
      user.saved_tales.push(taleName);
      fs2.writeFileSync(jsonPathUsers, JSON.stringify(users, null, 2), "utf-8");
    }
  },
};
