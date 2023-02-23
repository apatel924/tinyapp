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

const userLookupById = (user_id) => {
  return users[user_id];
};

const urlsForUser = (user_id) => {
  const allKeys = Object.keys(urlDatabase);
  const userURLs ={};
  for (let entry of allKeys) {
    if (urlDatabase[entry].userID === user_id) {
      userURLs[entry] = urlDatabase[entry];
    };
  };
  return userURLs;
}

const validateURLForUser = (URLid, user_id) => {
  const userURLs = urlsForUser(user_id);
  if (!userURLs[URLid]){
    return false;
  };
  return true
}

const getUserByEmail = function (email) {
  for (let user in users) {
    if (email === users[user]["email"]) {
      return user;
    }
  }
  return null;
};

// home page
app.get('/urls', (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/urls_login')
  }
  const userURLs = urlsForUser(req.cookies.user_id);
  const templateVars = { urls: userURLs, user_id: userLookupById(req.cookies.user_id) };
  res.render('urls_index', templateVars);
});

// new url page
app.get('/urls/new', (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/urls_login')
  } 
  const templateVars = { user_id: userLookupById(req.cookies.user_id) };
  res.render('urls_new', templateVars);
});

// short url page
app.get('/urls/:id', (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/urls_login')
  }
  const URLid = req.params.id;
  const user_id = req.cookies.user_id;
  if (!validateURLForUser(URLid, user_id)){
    return res.status(404).send('404 not found');
  }
  const longURL = urlDatabase[URLid].longURL;
  const templateVars = { URLid, longURL, user_id: userLookupById(req.cookies.user_id)  };
  res.render('urls_shows', templateVars);
});

// register
app.get('/urls_register', (req, res) => {
  if (req.cookies.user_id) {
    res.redirect('/urls')
  }
  const templateVars = {user_id: null};
  res.render('urls_register', templateVars);
});

// login page
app.get("/url_login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});

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
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const targetUser = getUserByEmail(email);
   if (!targetUser || targetUser.password !== password) {
    return res.status(403).send('403 - Forbidden <br> Invalid combination')
  }
  res.cookie('user_id', targetUser.id);
  res.redirect(`/urls`);
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