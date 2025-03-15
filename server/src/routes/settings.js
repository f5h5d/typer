const express = require("express");
const Settings = require("../models/settings");
const Users = require("../models/users");

const router = express.Router();
const { sequelize } = require("../config/database");
const { DEFAULT_SETTINGS } = require("../../constants/constants.json");
const authenticate = require("../middleware/authentication");
const jwt = require("jsonwebtoken");

router.post("/create/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    await Settings.create({
      ...DEFAULT_SETTINGS,
      user_id,
    });

    res.status(200).end()
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
});

router.get("/get/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const userSettings = await Settings.findOne({ where: { user_id } });
    res.status(200).send(userSettings);
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
});

router.post("/update", authenticate, async (req, res) => {
  try {
    const { user_id } = req.user;

    const userSettings = await Settings.findOne({ where: { user_id } });
    const user = await Users.findOne({ where: { user_id } });
    await userSettings.update(req.body);

    jwt.sign(
      {
        email: user.email,
        user_id: user.user_id,
        username: user.username,
        settings: {
          ...userSettings.dataValues,
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
      (err, token) => {
        if (err) throw err;
        res
          .status(200)
          .cookie("token", token, {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: true, // Prevent JavaScript access
            secure: false, // Must be true in production
            sameSite: "Lax", // "None" requires "secure: true"
            path: "/",
          })
          .json({ message: "Successfuly updates settings!" });
      }
    );
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
});


router.get("/defaultSettings", (req, res) => {
  try {
    res.status(200).send(DEFAULT_SETTINGS)
  } catch (err) {
    res.status(500).send({message: "Interal server error"})
  }

})

module.exports = router;
