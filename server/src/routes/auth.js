require("dotenv").config(); // for env file
const express = require("express");

const Users = require("../models/users");
const Token = require("../models/token");

const sendEmail = require("../nodemailer/sendEmail");
const crypto = require("crypto");
const axios = require("axios");

const { hashPassword, comparePassword } = require("../helpers/auth");
const router = express.Router();
const { sequelize } = require("../config/database");
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/authentication");

const { STARTER_RANK_RATING } = require("../../constants/constants.json")

router.post("/register", async (req, res) => {
  try {
    let { username, email, password } = req.body;
    username = username.trim();
    email = email.trim();
    password = password.trim();

    // check if email in use
    const emailExists = await Users.findOne({ where: { email } });

    if (emailExists)
      return res.status(400).send({ message: "Email already in use" });
  
    const usernameExists = await Users.findOne({ where: { username }});

    if (usernameExists) return res.status(400).send({message: "Username in use, try another one"})

    password = await hashPassword(password);

    const user = await Users.create({
      username,
      email,
      password,
      verified: false,
      rankRating: STARTER_RANK_RATING,
    });

    await axios.post(`${process.env.API}/settings/create/${user.user_id}`); // create settings for user

    const token = await Token.create({
      user_id: user.user_id,
      token: crypto.randomBytes(32).toString("hex"),
    });

    const url = `${process.env.BASE_URL}/verify/${token.token}`;
    await sendEmail(user.username, user.email, "Verify Email", url, true);

    return res.status(200).send({
      message: "Account created successfully, please verify email!",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error, could not create account, try again.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    const user = await Users.findOne({ where: { email } });

    if (!user)
      return res
        .status(401)
        .send({ message: "Incorrect email and password combination" });

    const match = await comparePassword(password, user.password);

    if (!match)
      return res
        .status(401)
        .send({ message: "Incorrect email and password combination" });

    if (!user.verified) {
      let token = await Token.findOne({
        where: {
          user_id: user.user_id,
        },
      });

      if (!token) {
        token = await Token.create({
          user_id: user.user_id,
          token: crypto.randomBytes(32).toString("hex"),
        });
      }
      const url = `${process.env.BASE_URL}/verify/${token.token}`;
      await sendEmail(user.username, user.email, "Verify Email", url, true); // send new email for user

      res.status(403).send({
        message:
          "An email was sent to your account, please verify before logging in!",
      });
    }

    const userSettings = await axios.get(
      `${process.env.API}/settings/get/${user.user_id}`
    ); // get settings of user

    jwt.sign(
      {
        email: user.email,
        user_id: user.user_id,
        username: user.username,
        settings: {
          ...userSettings.data,
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: true, // Prevent JavaScript access
            secure: false, // Must be true in production
            sameSite: "Lax", // "None" requires "secure: true"
            path: "/",
          })
          .json({
            email: user.email,
            user_id: user.user_id,
            username: user.username,
            settings: {
              ...userSettings.data,
            },
          });
      }
    );
  } catch {
    res
      .status(500)
      .json({ message: "Internal server error, could not log in" });
  }
});

router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const userToken = await Token.findOne({ where: { token } });
    if (!userToken) return res.status(404).json({ message: "Invalid Link" });
    const user = await Users.findOne({ where: { user_id: userToken.user_id } });
    if (!user) return res.status(401).json({ message: "Invalid Link" });

    if (user.verified)
      return res
        .status(401)
        .json({ message: "Already verified, close please close tab" });

    if (!token) return res.status(401).json({ message: "Invalid Link" });

    await user.update({verified: true}); // updated user so they are verified in the database

    await userToken.destroy(); // delete token once user verified

    res.status(200).send({ message: "Email Verified" });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Interal server error, could not verify email" });
  }
});

router.get("/resetPassword/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const user = await Users.findOne({ where: { email } });

    if (!user) {
      res.status(404).send({ message: "User with this email does not exist" });
      return;
    }

    console.log(user.user_id);
    const token = await Token.create({
      user_id: user.user_id,
      token: crypto.randomBytes(32).toString("hex"),
    });

    const url = `${process.env.BASE_URL}/reset/${token.token}`;
    await sendEmail(user.username, user.email, "Verify Email", url, false); // send reset email to user

    res.status(200).send({
      message: "Successfuly sent an reset email, please check your inbox!",
    });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Internal server error, could not send email" });
  }
});

router.get("/setPassword/:password/:token", async (req, res) => {
  try {
    const { password, token } = req.params;
    const userToken = await Token.findOne({ where: { token } });

    if (!userToken) return res.status(404).send({ message: "invalid link" });

    const user = await Users.findOne({ where: { user_id: userToken.user_id } });

    if (!user) return res.status(404).send({ message: "invalid link" });

    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;

    await user.update({ password: hashedPassword });

    await userToken.destroy();

    res.status(200).send({ message: "Successfully changed password!" });
  } catch (err) {
    res.status(500).send({ message: "Unexpected error occured" });
  }
});

router.get("/fetchUser", (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      jwt.verify(
        token,
        process.env.JWT_SECRET,
        { expiresIn: "30d" },
        (err, user) => {
          if (err) return res.status(400).send({ message: "Invalid token" });
          res.status(200).json(user);
        }
      );
    }
  } catch (err) {
    res.status(500).send({ message: "Internal error, could not fetch user" });
  }
});

router.get("/logout", (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // Must match login settings
      sameSite: "Lax", // Must match login settings
      path: "/", // Must match login settings
    });

    res.cookie("token", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: false, // Must match login settings
      sameSite: "Lax", // Must match login settings
      path: "/", // Must match login settings
    });
    res.status(200).json({ message: "Successfully logged out" });
  } catch (err) {
    res.status(500).json({ message: "Internal error, could not logout" });
  }
});

module.exports = router;
