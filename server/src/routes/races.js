const express = require("express");
const Races = require("../models/races");

const router = express.Router();
const { sequelize } = require("../config/database");
const { Sequelize } = require("sequelize");
const authenticate = require("../middleware/authentication");
const { GUEST_STAT_INFO, STAT_OPTIONS } = require("../../constants/constants.json");
const axios = require("axios")



router.get("/guestStatInfo", (req, res) => {
  try {
    res.status(200).send(GUEST_STAT_INFO)
  } catch(err) { 
    res.status(500).send({message: "Internal server error"})
  }
})
router.post("/track", authenticate, async (req, res) => {
  try {
    const { user_id } = req.user;

    const race = await Races.create({
      ...req.body, user_id
    });



    const response = await axios.get(`${process.env.API}/races/stats/${user_id}`)

    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

router.get("/stats/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const userStatsPromise = Races.findOne({
      where: { user_id },
      attributes: [
        [
          Sequelize.fn("AVG", Sequelize.cast(Sequelize.col("wpm"), "integer")),
          "averageWpm",
        ],
        [
          Sequelize.fn(
            "AVG",
            Sequelize.cast(Sequelize.col("accuracy"), "integer")
          ),
          "averageAccuracy",
        ],
        [
          Sequelize.fn(
            "MAX",
            Sequelize.cast(Sequelize.col("race_number"), "integer")
          ),
          "totalRaces",
        ],
        [
          Sequelize.fn("MAX", Sequelize.cast(Sequelize.col("wpm"), "integer")),
          "highestWpm",
        ],
      ],
    });

    const mostRecentRacePromise = Races.findOne({
      where: { user_id },
      order: [["race_number", "DESC"]],
    });

    const totalRacesWonPromise = Races.count({
      where: { user_id, won: true },
    });

    const lastTenRacesPromise = sequelize.query(
      `
      SELECT 
        AVG(CAST(wpm AS INTEGER)) AS lasttenraceswpm, 
        AVG(CAST(accuracy AS INTEGER)) AS lasttenracesaccuracy
      FROM (
        SELECT wpm, accuracy
        FROM Races
        WHERE user_id = :user_id
        ORDER BY race_number DESC
        LIMIT 10
      ) AS subquery
      `,
      {
        replacements: { user_id },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    try {
      // Resolve all promises in parallel
      const [userStats, mostRecentRace, totalRacesWon, [lastTenRaces]] =
        await Promise.all([
          userStatsPromise,
          mostRecentRacePromise,
          totalRacesWonPromise,
          lastTenRacesPromise,
        ]);

      // Extract user stats
      const averageWpm = parseInt(userStats?.get("averageWpm")) || null;
      const averageAccuracy =
        parseInt(userStats?.get("averageAccuracy")) || null;
      const totalRaces = userStats?.get("totalRaces") || null;
      const highestWpm = userStats?.get("highestWpm") || null;

      // Extract other race stats
      const mostRecentWpm = mostRecentRace?.get("wpm") || null;
      const mostRecentAccuracy = mostRecentRace?.get("accuracy") || null;

      console.log("most recent acc" + mostRecentAccuracy)
      const lastTenRacesWpm = parseInt(lastTenRaces?.lasttenraceswpm) || null;

      const lastTenRacesAccuracy =
        parseInt(lastTenRaces?.lasttenracesaccuracy) || null;

      const stats = {
        averageWpm,
        averageAccuracy,
        totalRaces,
        highestWpm,
        mostRecentWpm,
        mostRecentAccuracy,
        totalRacesWon,
        lastTenRacesWpm,
        lastTenRacesAccuracy,
        guest: false, // just extra
      };

      res.status(200).json(stats);
    } catch (error) {
      res.status(500).send({ message: "Internal server error" });
    }
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
});

router.get(
  "/history/:statSelection/:number",
  authenticate,
  async (req, res) => {
    try {
      let { number, statSelection } = req.params;
      let statQuery = {};

      if (statSelection == STAT_OPTIONS.UNRANKEDQ) {
        statQuery = { words_id: null };
      } else if (statSelection == STAT_OPTIONS.UNRANKEDD) {
        statQuery = { quote_id: null };
      }

      if (number == -1) number = null; // -1 means should load all and null loads all

      const { user_id } = req.user;

      const races = await Races.findAll({
        limit: number,
        where: {
          user_id: user_id,
          ...statQuery,
        },
        order: [["createdAt", "DESC"]],
      });

      res.status(200).send(races);
    } catch (err) {
      res.status(500).send({ message: "Internal server error" });
    }
  }
);

router.get("/mainStats/:statSelection", authenticate, async (req, res) => {
  try {
    const { statSelection } = req.params;
    const { user_id } = req.user;
    let queryParams = {};
    if (statSelection == STAT_OPTIONS.UNRANKEDQ) {
      queryParams = { words_id: null };
    } else if (statSelection == STAT_OPTIONS.UNRANKEDD) {
      queryParams = { quote_id: null, ranked: false };
    }

    const stats = await Races.findOne({
      attributes: [
        [Sequelize.fn("MAX", Sequelize.col("wpm")), "highestWpm"],
        [Sequelize.fn("AVG", Sequelize.col("wpm")), "averageWpm"],
        [Sequelize.fn("AVG", Sequelize.col("accuracy")), "averageAcc"],
        [Sequelize.fn("COUNT", Sequelize.col("race_number")), "totalRaces"],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal("CASE WHEN won = true THEN 1 ELSE 0 END")
          ),
          "totalWins",
        ], // Assuming 'win' is 1 for a win, 0 otherwise
      ],
      where: {
        user_id: user_id,
        ...queryParams,
      },
    });

    res.status(200).send(stats);
  } catch (err) {
    res
      .status(500)
      .send({ message: "Internal server error, could not get stats" });
  }
});

router.get("/highestWpm", async (req, res) => {
  try {
    // const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    // const races = await Races.findAll({
    //   limit: 10,
    //   where: {
    //     createdAt: {
    //       [Sequelize.Op.gte]: oneHourAgo,
    //     },
    //   },
    //   order: [["wpm", "DESC"]],
    // });

    const races = await sequelize.query(
      `
      SELECT r.*, u.username
      FROM Races r
      JOIN Users u ON r.user_id = u.user_id
      WHERE r.wpm = (
        SELECT MAX(wpm) FROM Races r2 WHERE r2.user_id = r.user_id
      )
      ORDER BY r.wpm DESC
      LIMIT 10
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).send(races);
  } catch (err) {
    res.status(500).send({message: "Interal server error"});
  }
});

module.exports = router;
