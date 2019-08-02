# How to run
1. Start the server by:
    ```
    npm install && npm start
    ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser.

3. Test
    ```
    npm test
    ```

# Improvements (not yet implemented)
## Design
- Relate alerts to load average time series chart. Because alerts are generated from data in the charts, it would be intuitive to relate the two.
  - Mark alerts in the chart.
  - Click an alert to go to the mark of that alert in the chart.
- Time travel: show both load average and alerts on a given time range. This helps investigating historical issues. This also helps users share snapshots of the app.
## Code
- Use typescript to define and guard data types.


# Decisions made
- Use websocket to reduce network traffic, especially multiple browser windows/tabs are opened.
- To reduce network traffic, server pushes load averages and alerts for the last 10 minutes at socket connection, then pushes only the newly generated load average and alert.
- To reduce dependencies on third party code and reduce boilerplate, don't use any front-end framework (e.g. Vue), though a framework may make the code look cleaner (e.g. data binding to reduce complexity updating the alert list).

# Modify the code
To change the interval of load data, or change the alert threshold (and more), modify the constants at the top of `server.js` or `client/client.js`.

**Note** that rerun `npm start` is required for the changes in `server.js` to take effect. **All previously collected data will be lost.** 