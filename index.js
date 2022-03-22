const express = require('express');
const app = express();
const http = require('http');
const { constants } = require('perf_hooks');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
// test
var players = [];

function playerSearch(id) {
  for (var i = 0; i < players.length; i++) {
    if (players[i].id == id) {
      return i;
    }
  }
  return -1;
}

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/game', (req, res) => {
  res.sendFile(__dirname + '/views/game.html');
});

io.on('connection', (socket) => {
  socket.on('disconnect', function () {
    var i = playerSearch(socket.id);
    players.splice(i, 1);
  });
  socket.on('name', function (name) {
    players[playerSearch(socket.id)].name = name;
  });

  players.push({
    id: socket.id,
    x: 0,
    y: 0,
    vel: 0.5,
    dx: 0,
    dy: 0,
    friction: 0.9,
    name: "",
    keys: {
      up: false,
      down: false,
      right: false,
      left: false,
    }
  });

  socket.idNum = playerSearch(socket.id);

  setInterval(function () {
    socket.idNum = playerSearch(socket.id);
    var i = socket.idNum;
    if (players[i]) {
      socket.emit('players', players);

      if (players[i].keys.up) {
        players[i].dy += -players[i].vel;
      }
      if (players[i].keys.left) {
        players[i].dx += -players[i].vel;
      }
      if (players[i].keys.down) {
        players[i].dy += players[i].vel;
      }
      if (players[i].keys.right) {
        players[i].dx += players[i].vel;
      }

      players[i].x += players[i].dx;
      players[i].y += players[i].dy;
      players[i].dx *= players[i].friction;
      players[i].dy *= players[i].friction;
      if (players[i].x > 20 * 40 - 20) {
        players[i].x = 20 * 40 - 20;
      }
      if (players[i].x < - 20 * 40) {
        players[i].x = -20 * 40;
      }
      if (players[i].y > 20 * 40 + 20) {
        players[i].y = 20 * 40 + 20;
      }
      if (players[i].y < - 20 * 40) {
        players[i].y = -20 * 40;
      }
    }
  }, 1000 / 60);
  socket.emit('id', socket.id);
  socket.on('keys', function (key) {
    var i = socket.idNum;
    if (players[i]) {
      players[i].keys = key;
    }
  });
  socket.on('placeblock', function (m) {
    
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});