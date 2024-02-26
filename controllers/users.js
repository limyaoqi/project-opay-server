const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const { SECRET_KEY } = process.env;

router.post("/register", async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;
    const userFound = await User.findOne({ username });
    const emailFound = await User.findOne({ email });

    if (userFound)
      return res.json({ msg: "Username have been registered", status: 400 });
    if (emailFound)
      return res.json({ msg: "Email have been registered", status: 400 });
    if (fullname.length < 3)
      return res.json({
        msg: "Fullname should be atleast 3 characters ",
        status: 400,
      });
    if (username.length < 8)
      return res.json({
        msg: "Username should be atleast 8 characters",
        status: 400,
      });
    if (email.length < 8)
      return res.json({
        msg: "Email should be atleast 8 characters",
        status: 400,
      });
    if (password.length < 8)
      return res.json({
        msg: "Password should be atleast 8 characters",
        status: 400,
      });

    let user = new User(req.body);
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(password, salt);
    user.password = hash;
    user.save();

    return res.json({ msg: "Registered Successfully", user });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    let userFound = await User.findOne({ username });
    if (!userFound) {
      return res.json({ msg: "Invalid Credentials", status: 400 });
    }

    let isMatch = bcrypt.compareSync(password, userFound.password);
    if (!isMatch) {
      return res.json({ msg: "Invalid Credentials", status: 400 });
    }

    userFound = userFound.toObject();
    delete userFound.password;

    let token = jwt.sign({ data: userFound }, SECRET_KEY, { expiresIn: "7d" });

    return res.json({
      token,
      user: userFound,
      msg: "Logged in successfully",
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

module.exports = router;
