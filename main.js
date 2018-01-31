var mcpadc = require('mcp-spi-adc'); // for the multiplexer
var express = require('express') // socket dependencies
var app = require('express')(); // socket dependencies
var http = require('http').Server(app); // for http comm
var io = require('socket.io')(http); // websocket
var _ = require('lodash'); // utility

app.use(express.static('assets'))

var openchannels = 8

var readings = _.times(openchannels)

var channels = _(openchannels).times(i => {
  return mcpadc.open(i, {speedHz: 1350000}, function() {
    var cmp = this
    setInterval(function() {
      mark(i);
    }, 100)
  })
});

console.log(readings)
console.log(channels)

function mark(chnum) {
  var read = channels[chnum].read(function(err, reading) {
    var reading_obj = {
      chnum,
      reading,
      calibrated: chnum < 4 ? (reading.value-.5)/.5 : (reading.value-.15)/.3
    }
    io.emit('reading', reading_obj)
    readings[chnum] = reading
  })



  // console.log(readings)
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket){
  socket.emit("setup", {
    openchannels: openchannels
  })
  console.log('a user connected');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
