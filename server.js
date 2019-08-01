// data
const loadAvgs = [];
const alerts = [];
// config
const historyLengthInMinutes = 10;
const fetchLoadAvgFrequencyInSeconds = 10;
const alertCoverageInMinutes = 2;
const alertThreshold = 1;
const alertCoverageInLoadAvgDataPoints = Math.floor(alertCoverageInMinutes * 60 / fetchLoadAvgFrequencyInSeconds);


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


// functions to get load averages and alerts
const os = require('os');

function updateLoadAvgs(loadAvgs, historyLengthInMinutes) {
  loadAvgs.push(getLoadAvg());
  while (loadAvgs[0].time < Date.now() - historyLengthInMinutes * 60000) loadAvgs.shift();
}

function getLoadAvg() {
  return {
    time: Date.now(),
    load: os.loadavg()[0] / os.cpus().length
  };
}

function checkAlert(loadAvgs, alertCoverageInLoadAvgDataPoints, alertThreshold, alerts) {
  if (loadAvgs.length < alertCoverageInLoadAvgDataPoints) return;

  const avgLoadAvg = loadAvgs.slice(-alertCoverageInLoadAvgDataPoints).reduce((sum, dataPoint) => sum + dataPoint.load, 0) / alertCoverageInLoadAvgDataPoints;
  const alert = { time: Date.now(), load: avgLoadAvg };

  if (avgLoadAvg > alertThreshold) return { time: Date.now(), load: avgLoadAvg };
  else if (avgLoadAvg < alertThreshold && alerts.length > 0 && alerts[alerts.length - 1].load > alertThreshold) return { time: Date.now() };
}

function addAlert(alert, alerts, historyLengthInMinutes) {
  alerts.push(alert);
  while (alerts.length > 0 && alerts[0].time < Date.now() - historyLengthInMinutes * 60000) alerts.shift();
}


// exports for testing
exports.checkAlert = checkAlert;
