// HELPER FUNCTIONS

function generateRandomString() {
  return (Math.random().toString(36).substring(2, 6));
}

function getUserByEmail(users, email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

function getUserByID(users, ID) {
  for (const userID in users) {
    if (users[userID].id === ID) {
      return users[userID];
    }
  }
}

function urlsForUser(id, urlDatabase) {
  let userUrls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
}

function isLoggedIn(req, res, next) {
  const userId = req.session["user_id"];
  if (userId && getUserByID(userId)) {
    next();
  } else {
    res.redirect("/login");
  }
}

function isLoggedOut(req, res, next) {
  const userID = req.session['user_id'];
  if (!userID || !getUserByID(userID)) {
    next();
  } else {
    res.redirect('/urls');
  }
}

module.exports = {
  getUserByEmail,
  getUserByID,
  urlsForUser,
  isLoggedIn,
  isLoggedOut,
  generateRandomString
};