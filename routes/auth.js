const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const passport = require("passport");

const router = express.Router();

router.post("/join", isNotLoggedIn, async (req, res, next) => {
  const { email, passowrd, nick } = req.body;
  try {
    const exUser = await User.findOne({ where: { email: email } });
    if (exUser) {
      const message = encodeURIComponent("이미 있는 이메일입니다");
      return res.redirect(`/?error=${message}`);
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?error=${info.message}`);
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect("/");
    });
  })(req, res, next);
});

router.get("/logout", isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
