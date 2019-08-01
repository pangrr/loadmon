const assert = require('assert');

describe('The logic to generate alerts should be correct.', () => {
  const { checkAlert } = require('./data.js');

  it('should return undefined if load averages data points are not enough', () => {
    assert.equal(checkAlert([{ time: 0, load: 0 }], 2, 1, []), undefined);
  });

  it('should return an alert if the average load averages is above threshold', () => {
    const alert = checkAlert([{ time: 0, load: 1 }, { time: 1, load: 2 }], 2, 1, []);
    assert.equal(alert.load, 1.5);
    assert.equal(alert.time - Date.now() < 1000, true);
  });

  it('should return an alert recover if the average load averages is below threshold and the last item in the alert list is an alert', () => {
    const alert = checkAlert([{ time: 0, load: 1 }, { time: 1, load: 0 }], 2, 1, [{ time: 0, load: 1.5 }]);
    assert.equal(alert.load, undefined);
    assert.equal(alert.time - Date.now() < 1000, true);
  });

  it('should return undefined if the average load averages is below threshold and the last item in the alert list is not an alert', () => {
    assert.equal(checkAlert([{ time: 0, load: 1 }, { time: 1, load: 0 }], 2, 1, [{ time: 0 }]), undefined);
    assert.equal(checkAlert([{ time: 0, load: 1 }, { time: 1, load: 0 }], 2, 1, []), undefined);
  });
});
