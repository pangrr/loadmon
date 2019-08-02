// config
const sysstatsHistory = { lengthInMinutes: 100, entries: [] };
const loadAlertHistory = { lengthInMinutes: 100, entries: [] };
const sysstatsIntervalInSeconds = 10;
const loadAlertWindowInMinutes = 2;
const loadAlertThreshold = 1;

const { getSysstats, checkLoadAlert, updateHistory } = require('./sys-stats.js');


// websocket
const ws = require('ws');
const websocketServer = new ws.Server({ port: 3001 });

websocketServer.on('connection', socket => {
  socket.send(JSON.stringify({ sysstats: sysstatsHistory.entries }));
  socket.send(JSON.stringify({ alerts: loadAlertHistory.entries }));
});

setInterval(() => {
  const sysstats = getSysstats();
  updateHistory(sysstats, sysstatsHistory);
  websocketServer.clients.forEach(client => client.send(JSON.stringify({ sysstats: [sysstats] })));

  const alert = checkLoadAlert(sysstatsHistory, loadAlertHistory, loadAlertWindowInMinutes, loadAlertThreshold);
  if (alert) {
    updateHistory(alert, loadAlertHistory);
    websocketServer.clients.forEach(client => client.send(JSON.stringify({ alerts: [alert] })));
  }
}, sysstatsIntervalInSeconds * 1000);


// http server
const http = require('http');
const express = require('express');
const app = express().use(express.static('client'));
const server = http.createServer(app);
server.listen(3000, 'localhost');
