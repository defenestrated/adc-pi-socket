var mcpadc = require('mcp-spi-adc'); // for the multiplexer
var express = require('express') // socket dependencies
var app = require('express')(); // socket dependencies
var http = require('http').Server(app); // for http comm
var io = require('socket.io')(http); // websocket
var _ = require('lodash'); // utility

app.use(express.static('assets'))

var openchannels = 4
// RIGHT NOW SUPPORTS UP TO 24 (could potentially extend to 40)

var readings = _.times(openchannels)

console.log({speedHz: 1350000, busNumber:1, deviceNumber:0})


// to individually load channels,  vv uncomment vv
// var channels = [
//   mcpadc.open(3, {speedHz: 1350000, busNumber:1, deviceNumber:0}, function() {
//     setInterval(function(){mark(0)}, 100)
//   }),
//   mcpadc.open(1, {speedHz: 1350000, busNumber:1, deviceNumber:1}, function() {
//     setInterval(function(){mark(1)}, 100)
//   }),
//   mcpadc.open(1, {speedHz: 1350000, busNumber:1, deviceNumber:2}, function() {
//     setInterval(function(){mark(2)}, 100)
//   }),
//   mcpadc.open(5, {speedHz: 1350000, busNumber:1, deviceNumber:2}, function() {
//     setInterval(function(){mark(3)}, 100)
//   })
// ]


// programmatically load channels:
var channels = _(openchannels).times(i => {
  return mcpadc.open(i, {
    speedHz: 1350000,
    busNumber: 1,
    deviceNumber: Math.floor(i/8)
  }, function() {
    setInterval(function() {
      mark(i);
    }, 100)
  })
});

// console.log(readings)
console.log("starting up with " + openchannels + " channels")
console.log(channels)

function mark(chnum) {
  var read = channels[chnum].read(function(err, reading) {
    var reading_obj = {
      chnum,
      reading,
      manual_calibrated: chnum < 4 ? (reading.value-.5)/.5 : (reading.value-.15)/.3
      // this accommodates the first 4 standard CdS photoresistors, and the last 4 log-based sensors
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
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
