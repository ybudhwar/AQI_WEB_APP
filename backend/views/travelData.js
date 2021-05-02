const axios = require("axios");
const querystring = require("querystring");
const calculateCongestion = require("../controllers/getCongestion");
const { getPM2_5, getPMColor } = require("../controllers/getPM2_5");
const API_URL = "https://intermodal.router.hereapi.com/v8/routes";

function getTravelData(req, res) {
  let queryStr = req.params.query;
  let queryObj = querystring.parse(queryStr);
  let origin = queryObj.origin;
  let dest = queryObj.dest;

  let p = axios.get(API_URL, {
    params: {
      apiKey: process.env.here_api_key,
      alternatives: 10,
      destination: dest,
      origin: origin,
      return: "polyline,travelSummary",
      "transit[modes]": "-subway,-lightRail,-highSpeedTrain,-cityTrain", // remove undesirable transports
    },
  });
  p.then(async (response) => {
    let result = [];
    let minPm = 500,
      maxPm = 0;
    for (var i = 0; i < response.data.routes.length; i++) {
      try {
        const formattedRoute = await formatData(
          response.data.routes[i],
          maxPm,
          minPm
        );
        result = [...result, formattedRoute.routeData];
        (maxPm = formattedRoute.maxPm), (minPm = formattedRoute.minPm);
      } catch (err) {
        console.log(err);
      }
    }
    try {
      const pmResult = getPMColor(result, minPm, maxPm);
      const finalResult = await calculateCongestion(pmResult);
      res.json(finalResult).status(200);
    } catch (err) {
      console.log(err);
      res.json({ msg: "Error in processing data" }).status(400);
    }
  }).catch((error) => {
    if (error.response) {
      if (error.response.status == 400) {
        res.json({ msg: error.response.title }).status(400);
      } else if (error.response.status == 401) {
        res
          .json({ msg: "error while authorisation to the HERE map server" })
          .status(401);
      } else {
        res
          .json({
            msg: "Unknown error occured while fetching the data from server",
          })
          .status(error.response.status);
      }
    } else if (error.request) {
      res
        .json({ msg: "The request was made but no response was received" })
        .status(500);
    } else {
      res.json({ msg: "Internal server error" }).status(500);
    }
  });
}
async function formatData(route, maxPm, minPm) {
  let routeData = [];
  for (let i = 0; i < route.sections.length; i++) {
    try {
      const pmValue = await getPM2_5(
        (route.sections[i].departure.place.location.lat +
          route.sections[i].arrival.place.location.lat) /
          2,
        (route.sections[i].departure.place.location.lng +
          route.sections[i].arrival.place.location.lng) /
          2
      ); // get PM of midpoint
      maxPm = Math.max(pmValue, maxPm);
      minPm = Math.min(pmValue, minPm);
      // console.log(pmvalue);
      let travelTime = route.sections[i].travelSummary.duration;
      const sec = {
        travelTime,
        distance: route.sections[i].travelSummary.length,
        pmValue,
        begin: route.sections[i].departure.place.location,
        end: route.sections[i].arrival.place.location,
        transport: route.sections[i].transport,
        polyline: route.sections[i].polyline,
      };
      // console.log(sec)
      routeData = [...routeData, sec];
    } catch (err) {
      console.log(err);
    }
  }
  return { routeData, maxPm, minPm };
}

module.exports = getTravelData;
