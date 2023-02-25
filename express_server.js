const cookieSession = require('cookie-session');
const express = require("express");
const morgan = require('morgan');
const app = express();
const bcrypt = require("bcryptjs");
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");

const {
  getUserByEmail,
  getUserByID,
  urlsForUser,
  isLoggedIn,
  isLoggedOut,
  generateRandomString
} = require('./helpers.js');

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

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
    urls: urlsForUser(userId, urlDatabase),
    user: getUserByID(users, userId),
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
    user: getUserByID(users, userId),
  };
  res.render("urls_new", templateVars);
});

// short url page
app.get("/urls/:id", isLoggedIn, (req, res) => {
  if (req.session["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.send("Page not accessible");
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
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  res.render("urls_register", templateVars);
});

// login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  res.render("urls_login", templateVars);
});

// login endpoint
app.get("/login", isLoggedOut, (req, res) => {
  const userId = req.session["user_id"];
  const templateVars = {
    user: getUserByID(users, userId),
  };
  res.render("login", templateVars);
});

// POSTS

app.post("/urls", (req, res) => {
  const userId = req.session["user_id"];
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userId,
  };
  res.redirect("/urls");
});

// new url
app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send('403 - Forbidden Access <br> Login!');
  }
  const URLid = generateRandomString();
  urlDatabase[URLid] = {};
  urlDatabase[URLid].longURL = req.body.longURL;
  urlDatabase[URLid].userId = req.session.user_id;
  res.redirect(`/urls/${URLid}`);
});

// Login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = getUserByEmail(users, email);
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
app.post('/register',(req, res) =>{
  const email = req.body.email;
  const password = req.body.password;
    
  // Edge case - empty user or pass
  if (!email || !password) {
    return res.status(400).send('400 - Bad Request: Invalid combination');
  }
  // Edge case - user already exists
  if (getUserByEmail(email, users)) {
    return res.status(400).send('400 - Bad Request: Email already in use');
  }
    
  const id = generateRandomString();
  const hashPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id,
    email,
    password: hashPassword,
  };
  users[id] = newUser;
  req.session.user_id = id;
  res.redirect('/urls');
});

// edit while logged in
app.post("/urls/:id", isLoggedIn, (req, res) => {
  if (req.session["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.send('Access Restricted');
  }
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");
});

// Delete entry while logged in
app.post("/urls/:id/delete", isLoggedIn, (req, res) => {
  if (req.session["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.send('Access Restricted');
  }
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});