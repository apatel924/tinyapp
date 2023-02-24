const cookieSession = require('cookie-session');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const {
  getUserbyEmail,
  validateURLForUser,
  getUserbyID,
  urlsForUser,
  isLoggedIn,
  isLoggedOut,
  generateRandomString
} = require('./helpers.js');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["user_id"],
})
);

const bcrypt = require("bcryptjs");

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// Get functions

// route handler
app.get("/urls", isLoggedIn, (req, res) => {
  const userId = req.session["user_id"];
  const templateVars = {
    urls: urlsForUser(userId),
    user: getUserbyID(users, userId),
  };
  res.render("urls_index", templateVars);
});

// json object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// new url page
app.get("/urls/new", isLoggedIn, (req, res) => {
  const userId = req.session["user_id"];
  const templateVars = {
    user: getUserbyID(users, userID),
  };
  res.render("urls_new", templateVars);
});

// short url page
app.get("/urls/:id", isLoggedIn, (req, res) => {
  if (req.session["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.send(
      '<html><body>Error 401: Page not accessible </body></html>'
    );
  }
  const templateVars = {
    user: users[req.session["user_id"]],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_shows", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// register
app.get("/urls_register", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  res.render("urls_register", templateVars);
});

// login page
app.get("/urls_login", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  res.render("urls_login", templateVars);
});

// login endpoint
app.get("/login", isLoggedOut, (req, res) => {
  const userId = req.session["user_id"];
  const templateVars = {
    user: getUserbyId(users, userId),
  };
  res.render("login", templateVars);
});

// POSTS
// new url
app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send('403 - Forbidden Access <br> Login!');
  }
  const URLid = generateRandomString();
  urlDatabase[URLid] = {};
  urlDatabase[URLid].longURL = req.body.longURL;
  urlDatabase[URLid].userID = req.session.user_id;
  res.redirect(`/urls/${URLid}`);
});

// edit
app.post('/urls/:id', (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send('403 Forbidden Access <br> Login!');
  }
  const URLid = req.params.id;
  const user_id = req.session.user_id;
  if (!validateURLForUser(URLid, user_id)) {
    return res.status(404).send('404 not found');
  }
  const newURL = req.body.longURL;
  urlDatabase[URLid].longURL = newURL;
  res.redirect(`/urls`);
});

// Delete entry
app.post('/urls/:id/delete', (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send('403 - Forbidden Access <br> Login!');
  }
  const URLid = req.params.id;
  if (!validateURLForUser(URLid, req.session.user_id)) {
    return res.status(404).send('404 not found');
  }
  delete urlDatabase[URLid];
  res.redirect(`/urls`);
});

// Login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = getUserbyEmail(users, email);
  if (foundUser === null) {
    return res.status(403).send("Invalid email or password.");
  }
  if (!bcrypt.compareSync(password, foundUser.password)) {
    return res.status(403).send("Invalid email or password.");
  }
  req.session["user_id"] = foundUser.id;
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Register
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('400 - Bad Request <br> Invalid combination');
  }
  const foundUser = getUserbyEmail(users, email);
  if (foundUser) {
    return res.status(400).send('400 - Bad Request <br> Email already in use');
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  newUser = {
    id: generateRandomString(),
    email,
    password: hashedPassword,
  };
  users[newUser.id] = newUser;
  req.session["user_id"] = newUser.id;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});