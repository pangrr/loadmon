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
        scaleLabel: {
          display: true,
          labelString: 'Load Average'
        }
      }]
    }
  }
});

const socket = new WebSocket('ws://localhost:3001/');

socket.onmessage = event => {
  const chartData = chart.data.datasets[0].data;
  const message = JSON.parse(event.data);
  if (message.loadAvgs) {
    message.loadAvgs.forEach(dataPoint => chartData.push({ x: moment(dataPoint.time), y: dataPoint.load }));
    while (chartData.length > 0 && chartData[0].x.isBefore(moment().subtract(10, 'minutes'))) chartData.shift();
    chart.update();
  } else if (message.alerts) {
    message.alerts.forEach(alert => console.log(alert.time, alert.load));
  }
} 