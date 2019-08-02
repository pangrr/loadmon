// config
const loadDisplayPrecision = 2;
const chartWIndowSizeInMinutes = 10;
const alertTimeFormat = 'HH:mm:ss';

// chart
const chart = new Chart(document.getElementById('chart'), getChartConfig());

// websocket
const socket = new WebSocket('ws://localhost:3001/');
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.sysstats) {
    updateChartData(chart, message.sysstats);
    if (message.sysstats.length > 0) updateSysstats(message.sysstats[message.sysstats.length - 1]);
  } else if (message.alerts) {
    updateAlertList(message.alerts);
  }
}


// utils
function updateSysstats(sysstats) {
  document.getElementById('load').textContent = sysstats.load.toFixed(loadDisplayPrecision);
  document.getElementById('freemem').textContent = formatBytes(sysstats.freemem);
  document.getElementById('freedisk').textContent = formatBytes(sysstats.freedisk);
}

function updateChartData(chart, sysstats) {
  const chartData = chart.data.datasets[0].data;
  sysstats.forEach(dataPoint => chartData.push({ x: moment(dataPoint.time), y: dataPoint.load.toFixed(loadDisplayPrecision) }));
  while (chartData.length > 0 && chartData[0].x.isBefore(moment().subtract(chartWIndowSizeInMinutes, 'minutes'))) chartData.shift();
  chart.update();
}


function updateAlertList(alerts) {
  const alertList = document.getElementById('alerts');
  alerts.forEach(alert => {
    const alertItem = document.createElement('li');
    if (alert.type === 'highLoad') {
      alertItem.setAttribute('class', 'alert');
      alertItem.appendChild(document.createTextNode(`${moment(alert.time).format(alertTimeFormat)} high load alert, load = ${alert.load.toFixed(loadDisplayPrecision)}`));
    } else if (alert.type === 'highLoadRecover') {
      alertItem.setAttribute('class', 'alert-recover');
      alertItem.appendChild(document.createTextNode(`${moment(alert.time).format(alertTimeFormat)} high load alert recovered`));
    }
    if (alertList.childNodes.length > 0) alertList.insertBefore(alertItem, alertList.childNodes[0]);
    else alertList.appendChild(alertItem);
  });

  // limit list length
  while (alertList.childNodes.length > 200) alertList.removeChild(alertList.childNodes[alertList.childNodes.length - 1]);
}


function getChartConfig() {
  return {
    type: 'line',
    data: {
      datasets: [{
        borderColor: 'rgba(51, 153, 255, 0.6)',
        backgroundColor: 'rgba(51, 153, 255, 0.2)',
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
              minute: 'HH:mm'
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
  };
}


function formatBytes (bytes) {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) return;

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1000)), units.length - 1);
  const value = Number(bytes / Math.pow(1000, exponent));
  const unit = units[exponent];

  return `${value.toFixed(1)} ${unit}`;
}