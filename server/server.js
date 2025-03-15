// for env file
require('dotenv').config();
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}`}); 

const express = require("express");
const wordsRoutes = require("./src/routes/words");
const authRoutes = require("./src/routes/auth");
const raceRoutes = require("./src/routes/races");
const quotesRoutes = require("./src/routes/quotes");
const settingsRoutes = require("./src/routes/settings")
const app = express();
const cors = require("cors"); // for giving frontend permission
const { client } = require("./src/config/database");
const http = require("http");
const { Server } = require("socket.io");
const setUpSocket = require("./src/socket/socket")
const server = http.createServer(app);
const cookieParser = require("cookie-parser")




// options for which origin is allowed to do what
const corsOptions = {
  origin: "http://localhost:5173", // Replace with your frontend URL
  credentials: true,
  methods: "GET,POST,PUT,DELETE", // Specify allowed methods
  optionsSuccessStatus: 200, // Some browsers (e.g., IE11) choke on 204
};

// for socket.io
const io = new Server(server, {
  // give the server and then cors function inside
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET,POST,PUT,DELETE"],
  },
});
// Setup Socket.IO with the logic from ./socket/socket.js
setUpSocket(io)

// allow front end to use server
app.use(cors(corsOptions));

// middleware
app.use(express.json())
app.use(cookieParser());
app.use(express.urlencoded({extended: false}))

// Routes
app.use("/words", wordsRoutes);
app.use("/auth", authRoutes);
app.use("/races", raceRoutes)
app.use("/quotes", quotesRoutes)
app.use("/settings", settingsRoutes);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});


client.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});
