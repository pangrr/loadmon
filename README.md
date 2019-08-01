# How to run
```
yarn install
# or
npm install
# then
npm start
```
Open `http://localhost:3000` in your browser.

# Design Improvements (yet not implemented)
- Highlight alert coverage time window in chart. This makes it easier for user to relate alerts and the chart.
- Show both load average and alerts on a given time range. This is very helpful for debugging machine issues, and share app state.
- Click an alert to highlight an area in the chart. This also makes it easier to relate alerts and the chart.

# Decisions made
- Use websocket to save network traffic, especially multiple browser windows/tabs are opened.
- To save network traffic, server pushes load averages and alerts for the last 10 minutes at socket connection, then pushes only the newly generated load average and alert.
- To reduce dependencies on third party code and reduce biolerplate, don't use any front-end framework (e.g. Vue), though a framework may save some code (e.g. update alert list).

# Tuning
Tune by modifying the constants at the top of `server.js` and `client/client.js`. Rerun `npm start` is required for the changes in `server.js` to take effect, while all data will be lost. 