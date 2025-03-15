const express = require("express");
const Words = require("../models/words");

const router = express.Router();
const { sequelize } = require("../config/database");

router.get("/:level/:numOfWords", async (req, res) => {
  try {
    const { level, numOfWords } = req.params;

    const words = await Words.findOne({
      where: { level: level, word_count: numOfWords },
      order: sequelize.random(),
    });

    res.status(200).send(words);
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const words = await Words.findOne({
      where: { words_id: id },
    });

    res.status(200).send(words);
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = router;
