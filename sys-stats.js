const os = require('os');
const disk = require('diskusage');


exports.getSysstats = () => ({
  time: Date.now(),
  load: os.loadavg()[0] / os.cpus().length,
  freemem: os.freemem(),
  freedisk: disk.checkSync(os.platform() === 'win32' ? 'c:' : '/').available
});

/**
 * @param history: { lengthInMinutes: number, entries: [{ time: number, ... }] }
 */
exports.updateHistory = (entry, history) => {
  history.entries.push(entry);
  while (history.entries[0].time < Date.now() - history.lengthInMinutes * 60000) history.entries.shift();
}

/**
 * @return undefined - no alert, { time, load } - high load alert, { time } - recover high load alert
 */
exports.checkLoadAlert = (sysstatsHistory, alertHistory, alertWindowInMinutes, alertThreshold) => {
  const effectiveSysstatsHistory = sysstatsHistory.entries.filter(entry => entry.time >= Date.now() - alertWindowInMinutes * 60000);
  if (effectiveSysstatsHistory.length === 0) return;

  const avgLoad = effectiveSysstatsHistory.reduce((sum, entry) => sum + entry.load, 0) / effectiveSysstatsHistory.length;
  if (avgLoad > alertThreshold) return { time: Date.now(), type: 'highLoad', load: avgLoad };
  else if (avgLoad < alertThreshold && alertHistory.entries.length > 0 && typeof alertHistory.entries[alertHistory.entries.length - 1].load === 'number') return { time: Date.now(), type: 'highLoadRecover' };
}