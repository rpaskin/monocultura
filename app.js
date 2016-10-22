var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.set('port', (process.env.PORT || 3000));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  console.log('new user ' + socket.id + ' connected');
  io.emit('allSockets update', Object.keys(io.engine.clients));

  socket.on('disconnect', function() {
    console.log(socket.id + ' disconnected');
    io.emit('allSockets update', Object.keys(io.engine.clients));
  });

  socket.on('challenge', function(challenged) {
    io.to(challenged).emit('challenged', socket.id);
    console.log(socket.id + ' challenged ' + challenged);
  });

  socket.on('challenge accepted', function(challenger) {
    var game = challenger + ' VS ' + socket.id;
    io.to(challenger).emit('game start', game);
    io.to(socket.id).emit('game start', game);
    console.log(socket.id + ' accepted ' + challenger + '\'s challenge');
  });

  socket.on('game start', function(game) {
    socket.join(game);
    console.log(socket.id + ' entered game "' + game + '"');

    var players = game.split(' VS ');
    if (players[0] == socket.id) var opponent = players[1];
    else var opponent = players[0];

    socket.on('mark', function(info) {
      io.to(opponent).emit('mark', info);
      console.log(socket.id + ' marked an ' + info[0] + ' @ ' + info[1] + ':' + info[2]);
    });
  });
});

http.listen(app.get('port'));
