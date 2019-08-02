const assert = require('assert');

describe('The logic to generate alerts should be correct.', () => {
  const { checkLoadAlert } = require('./sys-stats.js');

  it('should return undefined if there is no system statistics in the alert window', () => {
    const sysStatsHistory = { lengthInMinutes: 10, entries: [{ time: Date.now() - 3 * 60 * 1000, load: 2 }, { time: Date.now() - 2 * 60 * 1000, load: 3 }] };
    const alertHistory = { lengthInMinutes: 10, entries: [{ time: Date.now() - 1000, load: 2 }] };
    const alertWindowInMinutes = 1;
    const alertThreshold = 1;

    const alert = checkLoadAlert(sysStatsHistory, alertHistory, alertWindowInMinutes, alertThreshold);

    assert.equal(alert, undefined);
  });

  it('should return a high load alert if the average load averages is above threshold', () => {
    const sysStatsHistory = { lengthInMinutes: 10, entries: [{ time: Date.now() - 3 * 60 * 1000, load: 2 }, { time: Date.now() - 2 * 60 * 1000, load: 3 }] };
    const alertHistory = { lengthInMinutes: 10, entries: [{ time: Date.now() - 1000, load: 2 }] };
    const alertWindowInMinutes = 5;
    const alertThreshold = 1;

    const alert = checkLoadAlert(sysStatsHistory, alertHistory, alertWindowInMinutes, alertThreshold);

    assert.equal(alert.type, 'highLoad');
    assert.equal(alert.load, 2.5);
    assert.equal(alert.time - Date.now() < 1000, true);
  });

  it('should return a high load alert recover if the average load averages is below threshold and there is an immediately previous high load alert', () => {
    const sysStatsHistory = { lengthInMinutes: 10, entries: [{ time: Date.now() - 3 * 60 * 1000, load: 2 }, { time: Date.now() - 2 * 60 * 1000, load: 3 }] };
    const alertHistory = { lengthInMinutes: 10, entries: [{ time: Date.now() - 1000, load: 2 }] };
    const alertWindowInMinutes = 5;
    const alertThreshold = 4;

    const alert = checkLoadAlert(sysStatsHistory, alertHistory, alertWindowInMinutes, alertThreshold);

    assert.equal(alert.type, 'highLoadRecover');
    assert.equal(alert.load, undefined);
    assert.equal(alert.time - Date.now() < 1000, true);
  });

  it('should return undefined if the average load averages is below threshold and there is no immediately previous high load alert', () => {
    const sysStatsHistory = { lengthInMinutes: 10, entries: [{ time: Date.now() - 3 * 60 * 1000, load: 2 }, { time: Date.now() - 2 * 60 * 1000, load: 3 }] };
    const alertHistory = { lengthInMinutes: 10, entries: [{ time: Date.now() - 1000 }] };
    const alertWindowInMinutes = 5;
    const alertThreshold = 4;

    const alert = checkLoadAlert(sysStatsHistory, alertHistory, alertWindowInMinutes, alertThreshold);

    assert.equal(alert, undefined);
  });
});
