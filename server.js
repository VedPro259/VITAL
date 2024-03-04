const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const express = require('express');
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

const app = express();
const httpServer = require('http').createServer(app);
const io = new Server(httpServer);

app.use(express.static('public')); 

parser.on('data', function(data) {
 io.emit('ledStatus', data);
});

io.on('connection', function(socket) {
 socket.on('toggleLed', function(data) {
   port.write(data);
 });
});

httpServer.listen(3500);