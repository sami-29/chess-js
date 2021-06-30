const envConfig = require("dotenv").config();
const express = require("express");
const Ably = require("ably");
const app = express();
const ABLY_API_KEY = process.env.ABLY_API_KEY;

let peopleAccessingTheWebsite = 0;
let players = {};
let playerChannels = {};
let gameOn = false;
let alivePlayers = 0;
let totalPlayers = 0;
let gameRoom;
let deadPlayerCh;
let gameTickerOn = false;

const realtime = Ably.Realtime({
  key: ABLY_API_KEY,
  echoMessages: false,
});

//create a uniqueId to assign to clients on auth
const uniqueId = function () {
  return "id-" + totalPlayers + Math.random().toString(36).substr(2, 16);
};

app.use(express.static("js"));

app.get("/auth", (request, response) => {
  const tokenParams = { clientId: uniqueId() };
  realtime.auth.createTokenRequest(tokenParams, function (err, tokenRequest) {
    if (err) {
      response
        .status(500)
        .send("Error requesting token: " + JSON.stringify(err));
    } else {
      response.setHeader("Content-Type", "application/json");
      response.send(JSON.stringify(tokenRequest));
    }
  });
});

app.get("/", (request, response) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  if (++peopleAccessingTheWebsite > MIN_PLAYERS_TO_START_GAME) {
    response.sendFile(__dirname + "/views/gameRoomFull.html");
  } else {
    response.sendFile(__dirname + "/views/intro.html");
  }
});

app.get("/gameplay", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/winner", (request, response) => {
  response.sendFile(__dirname + "/views/winner.html");
});

app.get("/gameover", (request, response) => {
  response.sendFile(__dirname + "/views/gameover.html");
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

realtime.connection.once("connected", () => {
  gameRoom = realtime.channels.get("game-room");
  gameRoom.presence.subscribe("enter", (player) => {
    alert('a player has joined')
  });
  gameRoom.presence.subscribe("leave", (player) => { });
  gameRoom.subscribe('enter',()=>alert(hey))
});