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

  if (avgLoadAvg > alertThreshold) return { time: Date.now(), load: avgLoadAvg };
  else if (avgLoadAvg < alertThreshold && alerts.length > 0 && alerts[alerts.length - 1].load > alertThreshold) return { time: Date.now() };
}


function addAlert(alert, alerts, historyLengthInMinutes) {
  alerts.push(alert);
  while (alerts.length > 0 && alerts[0].time < Date.now() - historyLengthInMinutes * 60000) alerts.shift();
}


exports.checkAlert = checkAlert;
exports.addAlert = addAlert;
exports.updateLoadAvgs = updateLoadAvgs;
exports.getLoadAvg = getLoadAvg;
