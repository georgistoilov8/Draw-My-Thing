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

io.on('connection', function (socket) {

  var username;
  var uniqueID = Math.floor(Math.random() * 90000000) + 10000000;
  username = 'guest'+uniqueID.toString();
  users.push(username);
  console.log(username + ' has connected to the server');
  console.log(users);
  io.emit('chat message', username + ' has joined.')

  for(var i in line_history) {
    console.log(colors[i]);
    socket.emit('draw_line', { line: line_history[i], color: colors[i] });
  };

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
      users.splice( index, 1 );
    }
  });

  socket.on('chat message', function(msg){
    io.emit('chat message', username + ": " + msg);
  });
});
