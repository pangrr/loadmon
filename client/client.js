// config
const loadPrecision = 2;
const chartDataWindowWithInMinutes = 10;
const alertTimeFormat = 'H:m:s';

// chart
const chart = new Chart(document.getElementById('chart'), {
  type: 'line',
  data: {
    datasets: [{
      borderColor: 'rgba(32, 194, 14, 0.6)',
      backgroundColor: 'rgba(32, 194, 14, 0.2)',
      data: []
    }]
  },
  options: {
    aspectRatio: 3,
    legend: {
      display: false
    },
    scales: {
      xAxes: [{
        type: 'time',
        time: {
          unit: 'minute',
          displayFormats: {
            minute: 'H:m'
          }
        }
      }],
      yAxes: [{
        ticks: {
          suggestedMin: 0,
          suggestedMax: 1
        },
        scaleLabel: {
          display: true,
          labelString: 'Load Average'
        }
      }]
    }
  }
});

// websocket
const socket = new WebSocket('ws://localhost:3001/');

socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.loadAvgs) {
    updateChartData(chart, message.loadAvgs);
  } else if (message.alerts) {
    updateAlertList(message.alerts);
  }
}


// utils
function updateChartData(chart, loadAvgs) {
  const chartData = chart.data.datasets[0].data;
  loadAvgs.forEach(dataPoint => chartData.push({ x: moment(dataPoint.time), y: dataPoint.load.toFixed(loadPrecision) }));
  while (chartData.length > 0 && chartData[0].x.isBefore(moment().subtract(chartDataWindowWithInMinutes, 'minutes'))) chartData.shift();
  chart.update();
}


function updateAlertList(alerts) {
  const alertList = document.getElementById('alerts');
  alerts.forEach(alert => {
    const alertItem = document.createElement('li');
    if (typeof alert.load === 'number') {
      alertItem.setAttribute('class', 'alert');
      alertItem.appendChild(document.createTextNode(`High load generated an alert - load = ${alert.load.toFixed(loadPrecision)}, triggered at ${moment(alert.time).format(alertTimeFormat)}`));
    } else {
      alertItem.setAttribute('class', 'alert-recover');
      alertItem.appendChild(document.createTextNode(`High load alert was recovered at ${moment(alert.time).format(alertTimeFormat)}`));
    }
    if (alertList.childNodes.length > 0) alertList.insertBefore(alertItem, alertList.childNodes[0]);
    else alertList.appendChild(alertItem);
  });
}
