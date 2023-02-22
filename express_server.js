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

// Delete entry
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
})

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
})

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});