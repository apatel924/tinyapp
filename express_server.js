const cookieParser = require('cookie-parser');
const express = require("express");
const app = express();
app.use(cookieParser())
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

function generateRandomString() {
  return (Math.random().toString(36).substring(2, 6))
}

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

// HELPER FUNCTIONS
function getUserbyEmail(users, email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

const validateURLForUser = (URLid, user_id) => {
  const userURLs = urlsForUser(user_id);
  if (!userURLs[URLid]){
    return false;
  };
  return true
}

// Get functions

// route handler
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    urls: urlDatabase,
    user: users[userId],
  };
  res.render("urls_index", templateVars);
});

// json object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// new url page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

// short url page
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id; 
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});


// register
app.get("/urls_register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_register", templateVars);
});

// login page
app.get("/urls_login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});

// POSTS
// new url
app.post('/urls', (req, res) => {
  if (!req.cookies.user_id) {
    return res.status(403).send('403 - Forbidden Access <br> Login!')
  }
  const URLid = generateRandomString();
  urlDatabase[URLid] ={};
  urlDatabase[URLid].longURL = req.body.longURL;
  urlDatabase[URLid].userID = req.cookies.user_id;
  res.redirect(`/urls/${URLid}`);
});

// edit
app.post('/urls/:id', (req, res) => {
  if (!req.cookies.user_id) {
    return res.status(403).send('403 Forbidden Access <br> Login!')
  };
  const URLid = req.params.id;
  const user_id = req.cookies.user_id;
  if (!validateURLForUser(URLid, user_id)){
    return res.status(404).send('404 not found');
  };
  const newURL = req.body.longURL;
  urlDatabase[URLid].longURL = newURL;
  res.redirect(`/urls`);
});

// Delete entry
app.post('/urls/:id/delete', (req, res) => {
  if (!req.cookies.user_id) {
    return res.status(403).send('403 - Forbidden Access <br> Login!')
  }
  const URLid = req.params.id;
  if (!validateURLForUser(URLid, req.cookies.user_id)){
    return res.status(404).send('404 not found');
  }
  delete urlDatabase[URLid];
  res.redirect(`/urls`);
});

// Login
app.post("/urls_login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = getUserbyEmail(users, email);
  console.log("foundUser", foundUser);
  if (!foundUser) {
    return res.status(403).send("Invalid email or password.");
  }
  if (foundUser.password !== password) {
    return res.status(403).send("Invalid email or password.");
  }
  res.cookie("user_id", foundUser.id);
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// Register
app.post('/urls_register',(req, res) =>{
  const email = req.body.email;
  const password = req.body.password;
  if (getUserByEmail(email)) {
    return res.status(400).send('400 - Bad Request <br> Username already in use')
  };
  if (!email || !password){
    return res.status(400).send('400 - Bad Request <br> Invalid combination');
  };
  const id = generateRandomString();
  const newUser = {
    id,
    email,
    password,
  };
  users[id] = newUser;
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});