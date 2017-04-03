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
var line_history = [][];

var color = null;
io.on('connection', function (socket) {
  for(var i in line_history) {
    socket.emit('draw_line', { line: line_history[i], color_picked: line_history[i][1] });
  };
  socket.on('draw_line', function(data, c) {
    line_history.push(data.line, c);
    color = c;
    io.emit('draw_line', { line: data.line, color_picked: c });
  });
});
