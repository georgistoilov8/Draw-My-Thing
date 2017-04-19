var express = require('express'),
    app = express();
    http = require('http'),
    socketIo = require('socket.io');
var server = http.createServer(app);
var io = socketIo.listen(server);
server.listen(8080);
app.use(express.static(__dirname + '/public'));
console.log("Server running on 127.0.0.1:8080");

//tracking all lines of a draw
var line_history = [];
var colors = [];
var users = [];
var draw = [];    // Array of booleans for the users. We will use them to check if user should draw.
var clients = [];

io.on('connection', function (socket) {

  var username;
  var count_changes = 0;
  //var uniqueID = Math.floor(Math.random() * 90000000) + 10000000;
  //username = 'guest'+uniqueID.toString();
  //users.push(username);
  //console.log(username + ' has connected to the server');
  //console.log(users);
  //io.emit('chat message', username + ' has joined.')

  for(var i in line_history) {
    console.log(colors[i]);
    socket.emit('draw_line', { line: line_history[i], color: colors[i] });
  };

  socket.on('username', function(user){
    var username_previous = username;
    username = user;
    users.push(username);
    draw.push(true);
    clients.push(socket);
    count_changes += 1;
    if(count_changes > 1)
      io.emit('chat message', username_previous + ' has chainged his name to ' + username);
    else
      io.emit('chat message', username + ' has joined.');
    io.emit('username', username);
  });

  socket.on('draw_line', function(data) {
    line_history.push(data.line);
    colors.push(data.color);
    io.emit('draw_line', { line: data.line, color: data.color});
  });

  socket.on('disconnect', function(){
    console.log(username + ' has disconnected.');
    io.emit('chat message', username + ' has left.');
    var index = users.indexOf(username);
    if (index >= 0) {
      users.splice(index, 1);
      draw.splice(index, 1);
      clients.splice(index, 1);
    }
  });

  socket.on('chat message', function(msg){
    io.emit('chat message', username + ": " + msg);
  });
});

var previous_number;
var count_number = 0;
function GameTimer(user){
  console.log("OOO DON't DO IT");
  if(users.length > 0){
    var number;
    do{
      number = randomInt(0, users.length);
    }while(draw[number] != true);
    console.log(users[number] + ' is drawing now');
    draw[number] = false;
    clients[number].emit("start_drawing", true);
    count_number += 1;
    if(count_number > 1){
      clients[previous_number].emit("start_drawing", false);
    }
    if(CheckAllPlayers()){
      console.log("All players have drown.")
      for(var i = 0; i < users.length; i++){
        draw[i] = true;
      }
    }
    previous_number = number;
  }
}

function CheckAllPlayers(){
  var all_draw = true;
  var i;
  for(i = 0; i < users.length; i++){
    if(draw[i] == true){
      all_draw = false;
    }
  }

  return all_draw;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

setInterval(GameTimer, 5000);
