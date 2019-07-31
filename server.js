// load averages and alertsLastTenMinutes
const os = require('os');

const loadAvgs = [];
const alerts = [];
// config
const fetchLoadAvgFrequencyInSeconds = 3;
const alertCoverageInMinutes = 1;
const alertCoverageInLoadAvgDataPoints = Math.floor(alertCoverageInMinutes * 60 / fetchLoadAvgFrequencyInSeconds);
const historyLengthInMinutes = 10;
const alertThreshold = 0.4;
const loadAvgPrecision = 2;

function updateLoadAvgs(loadAvgs) {
  loadAvgs.push(getLoadAvg());
  while (loadAvgs[0].time < Date.now() - historyLengthInMinutes * 60000) loadAvgs.shift();
}

function getLoadAvg() {
  return {
    time: Date.now(),
    load: (os.loadavg()[0] / os.cpus().length).toFixed(loadAvgPrecision)
  };
}

function checkAlert(loadAvgs, alerts) {
  if (loadAvgs.length < alertCoverageInLoadAvgDataPoints) return;

  const avgLoadAvg = (loadAvgs.slice(-alertCoverageInLoadAvgDataPoints).reduce((sum, value) => sum + value, 0) / alertCoverageInLoadAvgDataPoints).toFixed(loadAvgPrecision);
  const alert = { time: Date.now(), load: avgLoadAvg };

  if (avgLoadAvg > alertThreshold || (avgLoadAvg < alertThreshold && alerts.length > 0 && alerts[alerts.length - 1].load > alertThreshold)) return alert;
}

function addAlert(alert, alerts) {
  alerts.push(alert);
  while (alerts.length > 0 && alerts[0].time < Date.now() - historyLengthInMinutes * 60000) alerts.shift();
}


// websocket
const ws = require('ws');
const websocketServer = new ws.Server({ port: 3001 });

websocketServer.on('connection', socket => {
  socket.send(JSON.stringify({ loadAvgs }));
  socket.send(JSON.stringify({ alerts }));
});

setInterval(() => {
  updateLoadAvgs(loadAvgs);
  websocketServer.clients.forEach(client => client.send(JSON.stringify({ loadAvgs: loadAvgs.slice(-1) })));

  const alert = checkAlert(loadAvgs, alerts);
  if (alert) {
    addAlert(alert, alerts);
    websocketServer.clients.forEach(client => client.send(JSON.stringify({ alerts: [alert] })));
  }
}, fetchLoadAvgFrequencyInSeconds * 1000);



// http server
const http = require('http');
const express = require('express');
const app = express().use(express.static('client'));
const server = http.createServer(app);
server.listen(3000, 'localhost');


// exports for testing
exports.checkAlert = checkAlert;
