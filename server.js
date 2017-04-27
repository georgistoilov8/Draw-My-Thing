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

var isCalled = false;
var winning_word;
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
    io.emit('draw_line', { line: line_history[i], color: colors[i] });
  };

  socket.on('username', function(user){
    var username_previous = username;
    username = user;

    if(count_changes > 1)
      io.emit('chat message', username_previous + ' has chainged his name to ' + username);
      var index = users.indexOf(username_previous);
      if (index !== -1) {
        users[index] = username;
      }
    else{
      users.push(username);
      draw.push(true);
      clients.push(socket);
      io.emit('chat message', username + ' has joined.');
    }
    io.emit('username', username);
    io.emit('get_users', users);
    if(count_changes == 0 && isCalled == false){
        GameTimer(user[0]);
        isCalled = true;
    }
    count_changes += 1;
  });

  socket.on('draw_line', function(data) {
    line_history.push(data.line);
    colors.push(data.color);
    io.emit('draw_line', { line: data.line, color: data.color});
  });

  socket.on('answer', function(data) {
    winning_word = data.word;
    console.log(winning_word);
    console.log(data.word + "  fuasiosadjoiwqjd");
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
    console.log(winning_word);
    console.log(msg.toString());
    if(msg.toString().trim() === winning_word){
      io.emit('chat message', username + " guessed the word");
    }else{
      io.emit('chat message', username + ": " + msg);
    }
  });
});

var previous_number;
function GameTimer(user){
  var count_number = 0;
  if(users.length > 0){
    var number;
    do{
      number = randomInt(0, users.length);
    }while(draw[number] != true);
    console.log(users[number] + ' is drawing now');
    io.emit('send_who_is_drawing', users[number]);
    io.emit('reset_buttons');
    draw[number] = false;
    clients[number].emit("start_drawing", true);
    for(var i = 0; i < users.length; i++){
        count_number++;
    }
    if(count_number > 1){
      console.log(count_number);
      clients[previous_number].emit("start_drawing", false);
    }
    if(CheckAllPlayers()){
      console.log("All players have drawn.")
      for(var i = 0; i < users.length; i++){
        draw[i] = true;
      }
    }
    previous_number = number;
    io.emit('send_timer', 5000);
    setInterval(GameTimer, 90000);
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

function IsUsersEmpty(){
  var isEmpty = true;
  for(var i = 0; i < users.length; i++){
    if(users[i] != null){
      isEmpty = false;
    }
  }
  return isEmpty;
}
