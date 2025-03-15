const express = require("express");
const Quotes = require("../models/quotes");
const router = express.Router();
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");

router.get("/:min/:max", async (req, res) => {
  try {
    const { min, max } = req.params;

    const quote = await Quotes.findOne({
      where: {
        char_count: {
          [Op.between]: [min, max], // find a data point where the char_count is between the two given values
        },
      },
      order: sequelize.random(),
    });

    res.status(200).send(quote);
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const quote = await Quotes.findOne({
      where: {
        quote_id: id,
      },
    });

    res.status(200).send(quote);
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = router;
