# How to run
1. Start the server by:
    ```
    yarn install
    # or
    npm install
    # then
    npm start
    ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser.

Run `npm test` to run the tests.

# Suggestion on design Improvements (not yet implemented)
- Relate alerts to load average time series chart. Because alerts are generated from data in the charts, it would be intuitive to relate the two.
  - Mark alerts in the chart.
  - Click an alert to go to the mark of that alert in the chart.
- Time travel: show both load average and alerts on a given time range. This helps investigating historical issues. This also helps users share snapshots of the app.

# Decisions made
- Use websocket to reduce network traffic, especially multiple browser windows/tabs are opened.
- To reduce network traffic, server pushes load averages and alerts for the last 10 minutes at socket connection, then pushes only the newly generated load average and alert.
- To reduce dependencies on third party code and reduce boilerplate, don't use any front-end framework (e.g. Vue), though a framework may save some code (e.g. two-way binding to save the code updating the alert list).

# Modify the code
To see more frequent load average data points, or change the alert threshold, modify the constants at the top of `server.js` or `client/client.js`.

Note that rerun `npm start` is required for the changes in `server.js` to take effect. All previously collected data will be lost. 