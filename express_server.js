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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// home page
app.get("/urls", (req, res) => {
  let username = req.cookies["username"] ? req.cookies["username"] : '';
  const templateVars = { urls: urlDatabase, username: username };
  res.render("urls_index", templateVars);
});

// new url page
app.get("/urls/new", (req, res) => {
  let username = req.cookies["username"] ? req.cookies["username"] : '';
  const templateVars = { username: username };
  // res.redirect("/urls");
  res.render("urls_new", templateVars);
});

// short url page
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase };
  res.render("urls_shows", templateVars);
});

// new url
app.post('/urls', (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

// edit
app.post('/urls/:id', (req, res) => {
  const id = req.body.longURL;
  urlDatabase[id] = newURL;
  res.redirect('/urls');
})

// Delete entry
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
})

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})

const userLookup = function (email) {
  for (let user in users) {
    if (email === users[user]["email"]) {
      return user;
    }
  }
  return null;
};

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("Please input username AND password");
  }
  if (userLookup(email)) {
    return res.status(400).send("Account exists. Please login");
  }
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});