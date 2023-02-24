// HELPER FUNCTIONS

function generateRandomString() {
  return (Math.random().toString(36).substring(2, 6));
}

function getUserbyEmail(users, email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

function validateURLForUser(URLid, user_id) {
  const userURLs = urlsForUser(user_id);
  if (!userURLs[URLid]) {
    return false;
  }
  return true;
}

function getUserbyID(users, ID) {
  for (const userID in users) {
    if (users[userID].id === ID) {
      return users[userID];
    }
  }
}

function urlsForUser(id) {
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
  if (userId && getUserbyId(userId)) {
    next();
  } else {
    res.redirect("/login");
  }
}

function isLoggedOut(req, res, next) {
  const userID = req.session['user_id'];
  if (!userID || !getUserbyID(userID)) {
    next();
  } else {
    res.redirect('/urls');
  }
}

module.exports = {
  getUserbyEmail,
  validateURLForUser,
  getUserbyID,
  urlsForUser,
  isLoggedIn,
  isLoggedOut,
  generateRandomString
};