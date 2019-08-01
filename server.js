// data
const loadAvgs = [];
const alerts = [];
// config
const historyLengthInMinutes = 10;
const fetchLoadAvgFrequencyInSeconds = 10;
const alertCoverageInMinutes = 2;
const alertThreshold = 1;
const alertCoverageInLoadAvgDataPoints = Math.floor(alertCoverageInMinutes * 60 / fetchLoadAvgFrequencyInSeconds);

const { updateLoadAvgs, checkAlert, addAlert } = require('./data.js');


// websocket
const ws = require('ws');
const websocketServer = new ws.Server({ port: 3001 });

websocketServer.on('connection', socket => {
  socket.send(JSON.stringify({ loadAvgs }));
  socket.send(JSON.stringify({ alerts }));
});

setInterval(() => {
  updateLoadAvgs(loadAvgs, historyLengthInMinutes);
  websocketServer.clients.forEach(client => client.send(JSON.stringify({ loadAvgs: loadAvgs.slice(-1) })));

  const alert = checkAlert(loadAvgs, alertCoverageInLoadAvgDataPoints, alertThreshold, alerts);
  if (alert) {
    addAlert(alert, alerts, historyLengthInMinutes);
    websocketServer.clients.forEach(client => client.send(JSON.stringify({ alerts: [alert] })));
  }
}, fetchLoadAvgFrequencyInSeconds * 1000);


// http server
const http = require('http');
const express = require('express');
const app = express().use(express.static('client'));
const server = http.createServer(app);
server.listen(3000, 'localhost');
