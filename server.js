const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { Server } = require('socket.io');

const port = new SerialPort({
 path: '\\\\.\\COM5',
 baudRate: 9600,
 dataBits: 8,
 parity: 'none',
 stopBits: 1,
 flowControl: false
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
const io = new Server(server, { cors: { origin: "*" } });

const caretakerNamespace = io.of('/caretaker');
const mainNamespace = io.of('/');

mainNamespace.on('connection', socket => {
  socket.on('message', data => {
      mainNamespace.emit('message', data);
  });
  socket.on('metrics', data => {
    socket.broadcast.emit('metrics', data); 
  });
  socket.on('medication', data => {
    socket.broadcast.emit('medication', data); 
  });
  socket.on('setDates', data => {
    socket.broadcast.emit('setDates', data); 
  }); 
  socket.on('toggleLed', function(data) {
      port.write(data);
  });
  socket.on('remov', data => {
    socket.broadcast.emit('remov', data); 
  })
  parser.on('data', function(data) {
    mainNamespace.emit('ledStatus', data);
  });
});

caretakerNamespace.on('connection', socket => {
});

app.use('/', express.static('public'));
app.use('/caretaker', express.static('caretaker'));

server.listen(3500, () => {
 console.log('Server is running on port 3500');
});