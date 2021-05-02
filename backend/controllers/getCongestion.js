const axios = require("axios");
const API_URL = "https://route.ls.hereapi.com/routing/7.2/calculateroute.json";

async function getCongestionData(route, results) {
  let promises = [];
  for (let i = 0; i < route.length; i++) {
    let p = axios.get(API_URL, {
      params: {
        waypoint0: `${route[i].begin.lat},${route[i].begin.lng}`,
        waypoint1: `${route[i].end.lat},${route[i].end.lng}`,
        mode: "fastest;car;traffic:enabled",
        apiKey: process.env.here_api_key,
      },
    });
    promises.push(p);
  }
  try {
    let responses = await Promise.all(promises);
    let result = [];
    for (let i = 0; i < route.length; i++) {
      let { baseTime, travelTime } = responses[
        i
      ].data.response.route[0].summary;
      let congestionValue = travelTime / baseTime;
      let congestionColor =
        route[i].transport.mode === "pedestrian"
          ? "green"
          : getCongestionColor(congestionValue);

      result = [...result, { ...route[i], congestionColor }];
    }
    results.push(result);
  } catch (err) {
    console.log(err);
  }
}
async function calculateCongestion(routes) {
  let results = [];
  for (let i = 0; i < routes.length; i++) {
    await getCongestionData(routes[i], results);
  }
  return results;
}

function getCongestionColor(congestionValue) {
  if (congestionValue < 1.25) return "green";
  else if (congestionValue >= 1.25 && congestionValue < 1.5) return "blue";
  else if (congestionValue >= 1.5 && congestionValue < 2) return "orange";
  else if (congestionValue >= 2) return "red";
}
module.exports = calculateCongestion;
