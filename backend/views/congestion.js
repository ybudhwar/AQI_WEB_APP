const axios = require("axios");
const { response } = require("express");
const API_URL = "https://route.ls.hereapi.com/routing/7.2/calculateroute.json";
function calculateCongestion(req, res, next) {
  let { route } = req.body;
  let promises = [];
  for (let i = 0; i < route.length; i++) {
    let p = axios.get(API_URL, {
      params: {
        waypoint0: `${route[i].begin.lat},${route[i].begin.lng}`,
        waypoint1: `${route[i].end.lat},${route[i].end.lng}`,
        mode: "fastest;car;traffic:enabled",
        apiKey: process.env.api_key,
      },
    });
    promises.push(p);
  }
  let results = [];
  let finalPromise = Promise.all(promises);
  finalPromise.then((responses) => {
    for (let i = 0; i < route.length; i++) {
      let { baseTime, travelTime } = responses[
        i
      ].data.response.route[0].summary;
      let congestionValue = travelTime / baseTime;
      let thickness = giveThickness(congestionValue);

      let result = { ...route[i], thickness };
      results.push(result);
    }
    res.send(results);
  });
  finalPromise.catch((err) => {
    res.status(404).json({ msg: err });
  });
}

function giveThickness(congestionValue) {
  if (congestionValue <= 1) return 1;
  else if (congestionValue > 1 && congestionValue < 2) return 1.5;
  else if (congestionValue >= 2) return 2;
}
module.exports = calculateCongestion;
