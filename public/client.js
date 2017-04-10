var socket = io();

document.addEventListener("DOMContentLoaded", function() {
   var mouse = {
      click: false,
      move: false,
      pos: {x:0, y:0},
      pos_prev: false
   };
   // get canvas element and create context
   var canvas  = document.getElementById('drawing');
   var context = canvas.getContext('2d');
   //var width   = window.innerWidth;
   //var height  = window.innerHeight;
   var width = 950;
   var height = 400;
   //var socket  = io.connect();

   var color;

   // set canvas to full browser width/height
   canvas.width = width;
   canvas.height = height;

   // register mouse event handlers
   canvas.onmousedown = function(e){ mouse.click = true; };
   canvas.onmouseup = function(e){ mouse.click = false; };

   canvas.onmousemove = function(e) {
      // normalize mouse position to range 0.0 - 1.0
      mouse.pos.x = e.clientX / width;
      mouse.pos.y = e.clientY / height;
      mouse.move = true;
   };

   // draw line received from server
	socket.on('draw_line', function (data) {
      var line = data.line;
      var c = data.color;
      context.beginPath();
      context.moveTo(line[0].x * width, line[0].y * height);
      context.lineTo(line[1].x * width, line[1].y * height);
      //color = document.getElementById('color_picker').value;
      context.strokeStyle = '#' + c.toString();
      context.lineWidth = 15;
      context.stroke();
   });

   // main loop, running every 25ms
   function mainLoop() {
      // check if the user is drawing
      if (mouse.click && mouse.move && mouse.pos_prev) {
        var c = document.getElementById('color_picker').value;
         socket.emit('draw_line', { line: [ mouse.pos, mouse.pos_prev ], color: c});
         mouse.move = false;
      }
      mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
      setTimeout(mainLoop, 25);
   }

   mainLoop();
});

$(function () {

  $('form').submit(function(){
    if($('#m').val() != ''){
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
      $('#messages').animate({scrollTop: $('#messages').prop("scrollHeight")}, 200);
    }
    return false;
  });

  socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg));
    window.scrollTo(0, document.body.scrollHeight);
  });


});
