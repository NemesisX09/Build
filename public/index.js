var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;
document.getElementsByClassName("main")[0].appendChild(canvas);
var socket = io();
var id;
var players = [];
var keys = {
  up: false,
  down: false,
  right: false,
  left: false,
}

var mouse = { x: 0, y: 0};

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

socket.emit('name', params.name);
socket.on('id', function(e) {
  id = e;
});

function playerSearch(id) {
  for (var i = 0; i < players.length; i++) {
    if (players[i].id == id) {
      return i;
    }
  }
  return -1;
}

function placeBlock() {
  socket.emit('placeblock', currentGlobalMouse);
}

socket.on('players', function(e) {
  players = e;
});

var currentGlobalMouse = {
  x: 0,
  y: 0,
}

function loop(time) {
  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var e = playerSearch(id);
  var mapsize = 40;
  var offsetX = players[e].x % mapsize;
  var offsetY = players[e].y % mapsize;
  ctx.textAlign = "left";
  ctx.fillText("(" + Math.round(players[e].x / mapsize) + ", " + Math.round(players[e].y / mapsize) + ")", 5, 20)

  ctx.globalAlpha = 0.25;
  for (var x = -1; x < canvas.width / mapsize; x++) {
    for (var y = -1; y < canvas.height / mapsize; y++) {
      if (players[e].x + (x * mapsize - offsetX) > -580 && players[e].x + (x * mapsize - offsetX) < 1040 && players[e].y + (y * mapsize - offsetY) > -580 && players[e].y + (y * mapsize - offsetY) < 1080) {
        ctx.strokeRect(x * mapsize - offsetX, y * mapsize - offsetY, mapsize, mapsize);
        if (mouse.x > x * mapsize - offsetX && mouse.y > y * mapsize - offsetY && mouse.x < x * mapsize - offsetX + mapsize && mouse.y < y * mapsize - offsetY + mapsize) {
          ctx.globalAlpha = 0.15;
          ctx.fillRect(x * mapsize - offsetX, y * mapsize - offsetY, mapsize, mapsize);
          ctx.globalAlpha = 0.25;
          currentGlobalMouse.x = players[e].x + (mouse.x - canvas.width / 2);
          currentGlobalMouse.y = players[e].y + (mouse.y - canvas.height / 2);
        }
      }
    }
  }
  ctx.globalAlpha = 1;
  for (var i = 0; i < players.length; i++) {
    var relativeX = canvas.width / 2 - 10 + (players[i].x - players[e].x);
    var relativeY = canvas.height / 2 - 10 + (players[i].y - players[e].y);
    ctx.fillRect(relativeX, relativeY, 20, 20);
    ctx.font = "15px Comic Sans MS";
    ctx.fillStyle = i == e ? "#03e9f4" : "white";
    ctx.textAlign = "center";
    ctx.fillText(players[i].name, relativeX + 10, relativeY + 40);
    ctx.fillStyle = "white";
  }
}


document.addEventListener("keydown", function(e) {
  if (e.key == "w") {
    keys.up = true;
  } else if (e.key == "s") {
    keys.down = true;
  } else if (e.key == "a") {
    keys.left = true;
  } else if (e.key == "d") {
    keys.right = true;
  }
  socket.emit('keys', keys);
});

document.addEventListener("keyup", function(e) {
  if (e.key == "w") {
    keys.up = false;
  } else if (e.key == "s") {
    keys.down = false;
  } else if (e.key == "a") {
    keys.left = false;
  } else if (e.key == "d") {
    keys.right = false;
  }
  socket.emit('keys', keys);
});

document.addEventListener("mousemove", function(e) {
  mouse = {
    x: e.x - window.innerWidth / 2 + canvas.width / 2,
    y: e.y - window.innerHeight / 2 + canvas.height / 2,
  }
});

document.addEventListener("mousedown", function (e) {

})

socket.on('resetId', function () {
  socket.emit('resetId')
})

setInterval(loop);