const NodeCache = require("node-cache");
const { TYPING_TYPE, GAME_MODES } = require("../../constants/constants.json");

console.log(GAME_MODES);
const axios = require("axios");
const rooms = new Map();
const privateRooms = new Map();

const roomsTextCache = new Map();
const privateRoomTextMap = new Map(); // will need to do constant searches for seeing if a roomID already exists so set is good as it is O(1) for searching

let lastCreatedPublicRoom = {}; // used for adding users to room, should fill this before moving on

const PREGAME_TIMER = 3;
const MAX_USERS_PER_GAME = 4;
const USER_JOIN_TIMER_LIMIT = 1;
const MAX_UPPER_LOWER_WPM_RANGE = 20;
const BOT_WPM_INTERVAL = 10;
const BOT_NAME = "Bot";

const USER_DEFAULT_WPM = 40;

const findWordFromCharacter = (index, text) => {
  const textArr = text.split(" ");
  let count = 0;
  for (let word of textArr) {
    count += word.length + 1; // plus one for space
    if (count > index) {
      return word;
    }
  }
};

module.exports = (io) => {
  io.on("connection", (socket) => {
    // for initilizations
    socket.on("create_private_room", () => {
      let room;

      do {
        // constantly loop to generate a code that doesnt already exist in the set
        room = Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, "0");
      } while (privateRooms.has(room));

      privateRooms.set(room, {
        usersCompleted: [],
        usersData: {},
        leaderboardData: [],
        preGameTimer: PREGAME_TIMER,
        id: room,
      });

      socket.emit("created_room", room);
    });

    socket.on("join_room", ([id, mode, userData, typingType]) => {
      let roomID = id; // for public set id to 0 by default which = false for the case  where new room is created
      let room;

      if (mode == GAME_MODES.PRIVATE) {
        // private room
        if (privateRooms.has(roomID)) {
          socket.emit("successfuly_joined_private_room", roomID);
          room = privateRooms.get(roomID);
        } else {
          socket.emit("room_doesnt_exist");
          return;
        }
      } else if (mode == GAME_MODES.MULTIPLAYER) {
        for (let [key, value] of rooms) {
          if (
            value.preGameTimer > USER_JOIN_TIMER_LIMIT && // make sure the time is not too low
            Math.abs(userData.lastTenRacesWpm - value.roomAverageWpm) <
              MAX_UPPER_LOWER_WPM_RANGE && // make sure user is in the "skill" range for the lobby
            Object.keys(value.usersData).length < MAX_USERS_PER_GAME && // number of players less than the max
            typingType == value.typingType // same typing type (quotes or words)
          ) {
            roomID = key;
          }
        }

        if (!roomID) {
          do {
            // constantly loop to generate a code that doesnt already exist in the set
            roomID = Math.floor(Math.random() * 1000000)
              .toString()
              .padStart(6, "0");
          } while (rooms.has(room));
        }

        socket.emit("get_room_id", roomID); // give roomID to user if in multiplayer mode

        if (!rooms.get(roomID)) {
          // room doesn't exist so must create room
          rooms.set(roomID, {
            usersCompleted: [],
            usersData: {},
            preGameTimer: PREGAME_TIMER,
            id: roomID,
            roomAverageWpm: 0, // only for multiplayer
            typingType: typingType,
          }); // usersCompleted stores id/username of users that have finished in order
          io.to(roomID).emit("pre_game_timer", rooms.get(roomID).preGameTimer); // tell all clients to set the pregame timer
          socket.emit("user_must_start_game", roomID); // ADD LATER
        }
        room = rooms.get(roomID); // set the room
        lastCreatedPublicRoom = rooms.get(roomID); // update the last created public room
      }

      socket.join(roomID);

      // Add new player to the room

      room.usersData["" + socket.id] = { ...userData, id: socket.id }; // update the data in the backend

      if (mode == GAME_MODES.MULTIPLAYER) {
        // do not need this calculation for private room
        room.roomAverageWpm = Math.round(
          (room.roomAverageWpm * (Object.keys(room.usersData).length - 1) +
            (userData.lastTenRacesWpm == null // this is needed because when user created their averageWPM at start is null
              ? USER_DEFAULT_WPM
              : userData.lastTenRacesWpm)) /
            Object.keys(room.usersData).length
        );
      }

      if (mode == GAME_MODES.PRIVATE) {
        const roomOwner = Object.keys(room.usersData).length == 1;
        room.leaderboardData = [
          ...room.leaderboardData,
          {
            id: socket.id,
            username: userData.username,
            wpm: 0,
            accuracy: 0,
            gamesPlayed: 0,
            roomOwner: roomOwner,
          },
        ];

        room.leaderboardData.sort(
          (userOne, userTwo) => userTwo.wpm - userOne.wpm
        ); // sort the users ascending order based on wpm

        io.to(roomID).emit("leaderboard_data", room.leaderboardData); // give all users leaderboard data
      }

      socket.to(roomID).emit("initialize_user_data_for_others", room.usersData); // give new user data of previous users

      socket.emit("initialize_user_id", socket.id); // give the client the socketID

      socket.emit("initialize_other_users_data", room.usersData);

      if (
        mode !== GAME_MODES.PRIVATE &&
        Object.keys(rooms.get(roomID).usersData).length == 1
      ) {
        // this user is first user in public lobby they in the room => must start it
        socket.emit("tell_user_to_start_game", roomID);
      }

      socket.emit("pre_game_timer", room.preGameTimer); // give the user the current pre-game-timer
    });

    socket.on("start_game", (mode, roomID, typingType, privateParams = {}) => {
      console.log("starting game");
      let totalBots = 0;
      let room =
        mode == GAME_MODES.MULTIPLAYER
          ? rooms.get(roomID)
          : privateRooms.get(roomID);
      io.to(roomID).emit("started_game");

      io.to(roomID).emit("pre_game_timer", room.preGameTimer); // tell all clients to set the pregame timer

      const startTime = Date.now();
      let lastSecondTracked = 0;

      const preGameInterval = setInterval(() => {
        // decrement the pregame timer for 10 seconds when lobby created
        const elapsedTime = Math.floor(Date.now() - startTime) / 1000;
        if (elapsedTime < lastSecondTracked) return;

        lastSecondTracked = elapsedTime;

        let url;

        if (mode == GAME_MODES.MULTIPLAYER) {
          url =
            typingType == TYPING_TYPE.QUOTES
              ? `${process.env.API}/quotes/10/100`
              : `${process.env.API}/words/1/10`;
        } else if (mode == GAME_MODES.PRIVATE) {
          url =
            typingType == TYPING_TYPE.QUOTES
              ? `${process.env.API}/quotes/${privateParams.minLength}/${privateParams.maxLength}`
              : `${process.env.API}/words/${privateParams.difficulty}/${privateParams.words}`;
        }

        // generate text
        if (room.preGameTimer == USER_JOIN_TIMER_LIMIT) {
          axios
            .get(url)
            .then((response) => {
              const typingData = {
                typingText:
                  typingType == TYPING_TYPE.QUOTES
                    ? response.data.quote
                    : response.data.words, // in database the typingText has a different column
                author: response.data.author,
                words_id: response.data.words_id,
                quote_id: response.data.quote_id,
              };

              if (mode == GAME_MODES.PRIVATE) {
                // if private lobby
                privateRoomTextMap.set(roomID, typingData);
                io.to(roomID).emit(
                  "update_private_typing_params",
                  privateParams
                );
              } else {
                // is a public lobby
                roomsTextCache.set(roomID, typingData);
              }
              io.to(roomID).emit("initialize_typing_quote", typingData); // send everyone in the room teh typing quote
            })
            .catch((err) => {
              console.log(err.response.data.message);
            });
        }

        room.preGameTimer -= 1;
        console.log(room.preGameTimer);

        if (
          room.preGameTimer == USER_JOIN_TIMER_LIMIT &&
          Object.keys(room.usersData).length < MAX_USERS_PER_GAME
        ) {
          const numberOfBotsNeeded =
            mode == GAME_MODES.MULTIPLAYER
              ? MAX_USERS_PER_GAME - Object.keys(room.usersData).length
              : 0;
          totalBots = numberOfBotsNeeded;
          const wpmIntervals = [0, -10, 10];
          for (let i = 0; i < numberOfBotsNeeded; i++) {
            room.usersData["" + i] = {
              username: BOT_NAME,
              wpm: 0,
              currentWord: "",
              percentage: 0,
              id: i,
              averageWpm: room.roomAverageWpm + wpmIntervals[i],
              averageAccuracy: 100,
              totalRaces: 10,
              highestWpm: room.roomAverageWpm + wpmIntervals[i],
              totalRacesWon: 5,
              mostRecentWpm: room.roomAverageWpm + wpmIntervals[i],
              mostRecentAccuracy: 100,
              lastTenRacesWpm: room.roomAverageWpm + wpmIntervals[i],
              lastTenRacesAccuracy: 100,
              guest: false,
            };
          }

          socket.emit("initialize_other_users_data", room.usersData);
        }

        if (room.preGameTimer == -1) {
          console.log("clearing internval: " + preGameInterval);
          clearInterval(preGameInterval);

          if (mode == GAME_MODES.MULTIPLAYER) {
            // should not be bots in private lobby
            simulateBots();
          }
        }

        console.log(roomID);
        io.to(roomID).emit("pre_game_timer", room.preGameTimer); // decrement the pregame timer for the clients
      }, 1000);

      const simulateBots = () => {
        // doesnt work for guests yet
        let botsCompleted = 0;
        const startTime = Date.now();
        const simulateBotsInterval = setInterval(() => {
          const userExists = Object.keys(room.usersData).find(
            (user) => room.usersData[user].username !== BOT_NAME
          );

          if (!userExists) {
            // if all users are done, then should stop bot simulation
            clearInterval(simulateBotsInterval);
            return;
          }
          for (let id in room.usersData) {
            const user = room.usersData[id];
            if (user.username == BOT_NAME && user.percentage < 100) {
              const elapsedSeconds = (Date.now() - startTime) / 1000;
              charactersWritten = Math.round(
                (user.averageWpm * 5 * elapsedSeconds) / 60
              );

              // Math.round(typingText.length / 5 / ((Date.now() - startTime) / 60000))
              const text = roomsTextCache.get(roomID).typingText; // CHANGE TO TEXT LATER (roomsTextCache.get(roomID).text)

              // check if bot is finished, if it is not then does regular things
              if (charactersWritten >= text.length) {
                user.wpm = Math.round(
                  (charactersWritten / 5 / elapsedSeconds) * 60
                );

                room.usersCompleted.push(user);
                room.usersCompleted.sort((a, b) => b.wpm - a.wpm);
                const index = room.usersCompleted.findIndex(
                  (user) => user.id == socket.id
                );
                socket.emit("user_finished_position", index + 1);
                user.percentage = 100;
                botsCompleted += 1;

                if (botsCompleted >= totalBots) {
                  io.to(roomID).emit("update_users_data", room.usersData);
                  clearInterval(simulateBotsInterval);
                }
              } else {
                const currentWord = findWordFromCharacter(
                  charactersWritten,
                  text
                );

                const wordsTyped =
                  text.substring(0, charactersWritten).split(" ").length - 1;
                const totalWords = text.split(" ").length;
                const percentage = (wordsTyped / totalWords) * 100;

                user.currentWord = currentWord;
                user.percentage = percentage;

                user.wpm = Math.round(
                  (charactersWritten / 5 / elapsedSeconds) * 60
                );
              }
            }
          }

          io.to(roomID).emit("update_users_data", room.usersData); // decrement the pregame timer for the clients
        }, 500);
      };
    });

    // update the data for all other clients
    socket.on("update_users_scores", (mode, roomID, data) => {
      let room =
        mode == GAME_MODES.MULTIPLAYER
          ? rooms.get(roomID)
          : privateRooms.get(roomID);

      if (!room) return; // when user leaves the race at the wrong time this can cause an error so this is to stop that

      room.usersData["" + data.id] = {
        ...room.usersData["" + data.id],
        ...data,
      }; // update the essential data
      socket.to(roomID).emit("update_users_data", room.usersData);
    });

    // when user finished test
    socket.on("user_finished_test", (mode, roomID, data) => {
      let room =
        mode == GAME_MODES.MULTIPLAYER
          ? rooms.get(roomID)
          : privateRooms.get(roomID);

      const userData = room.usersData[socket.id];

      if (!room) return; // sometimes when user reloads this runs so this is to counter that

      room.usersCompleted.push(userData);

      room.usersCompleted.sort((a, b) => b.wpm - a.wpm);

      const index = room.usersCompleted.findIndex(
        (user) => user.id == socket.id
      );

      socket.emit("user_finished_position", index + 1);

      if (mode == GAME_MODES.PRIVATE) {
        const user = room.leaderboardData.find(
          (element) => element.id == socket.id
        );

        user.gamesPlayed++;
        user.wpm = Math.round(
          (user.wpm * (user.gamesPlayed - 1) + data.wpm) / user.gamesPlayed
        );
        user.accuracy = Math.round(
          (user.accuracy * (user.gamesPlayed - 1) + data.accuracy) /
            user.gamesPlayed
        );

        room.leaderboardData = room.leaderboardData.sort(
          (userOne, userTwo) => userTwo.wpm - userOne.wpm
        );

        io.to(roomID).emit("leaderboard_data", room.leaderboardData); // give all users leaderboard data
      }
    });

    socket.on("leave_room", (mode, roomID) => {
      let room =
        mode == GAME_MODES.MULTIPLAYER
          ? rooms.get(roomID)
          : privateRooms.get(roomID);

      delete room.usersData[socket.id];

      const realUser = Object.keys(room.usersData).find(
        (user) => room.usersData[user].username !== BOT_NAME
      ); // see if there is a real user left in the server
      if (!realUser) {
        rooms.delete(roomID);
        roomsTextCache.delete(roomID);
      }

      socket.leave(roomID);
    });

    socket.on("back_to_lobby", (roomID) => {
      const room = privateRooms.get(roomID);
      room.preGameTimer = PREGAME_TIMER;
      room.usersCompleted = [];
      privateRoomTextMap.delete(roomID);

      Object.keys(room.usersData).map((user) => {
        room.usersData[user].wpm = 0;
        room.usersData[user].percentage = 0;
      });
      socket.to(roomID).emit("users_back_to_lobby");
    });

    socket.on("reset_game_values", async (roomID) => {
      const room = privateRooms.get(roomID);
      room.preGameTimer = PREGAME_TIMER;
      room.usersCompleted = [];
      privateRoomTextMap.delete(roomID);

      Object.keys(room.usersData).map((user) => {
        room.usersData[user].wpm = 0;
        room.usersData[user].percentage = 0;
      });

      io.to(roomID).emit("start_new_private_game");
    });

    socket.on("pre_disconnect", ([mode, roomID]) => {
      console.log("pre_disconnecting");
      if (mode === GAME_MODES.MULTIPLAYER) {
        const room = rooms.get(roomID);
        if (room === undefined) return;

        delete room.usersData[socket.id];
        socket
          .to(roomID)
          .emit("initialize_user_data_for_others", room.usersData);

        const realUser = Object.keys(room.usersData).find(
          (user) => room.usersData[user].username !== BOT_NAME
        ); // see if there is a real user left in the server
        if (!realUser) {
          rooms.delete(roomID);
          roomsTextCache.delete(roomID);
        }
      } else if (mode === GAME_MODES.PRIVATE) {
        const room = privateRooms.get(roomID);

        if (room === undefined) return;

        const leaderboardIndex = room.leaderboardData.indexOf(
          room.leaderboardData.find((element) => element.id == socket.id)
        );

        if (!room.leaderboardData[leaderboardIndex]) return;

        const wasLeader = room.leaderboardData[leaderboardIndex]["roomOwner"];

        room.leaderboardData.splice(leaderboardIndex, leaderboardIndex + 1);

        delete room.usersData[socket.id];

        if (wasLeader && room.leaderboardData.length > 0) {
          room.leaderboardData[0].roomOwner = true;
          socket.to(room.leaderboardData[0].id).emit("new_private_room_owner");
        }

        socket
          .to(roomID)
          .emit("initialize_user_data_for_others", room.usersData);
        io.to(roomID).emit("leaderboard_data", room.leaderboardData); // give all users leaderboard data

        if (Object.keys(room.usersData).length == 0) {
          privateRooms.delete(roomID);
          privateRoomTextMap.delete(roomID);
        }
      }

      socket.leave(roomID);
    });

    socket.once("disconnect", (reason) => {
      console.log("disconnected");
    });
  });
};
