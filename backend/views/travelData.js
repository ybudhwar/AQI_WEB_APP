const axios = require("axios");
const querystring = require("querystring");
const { getPM2_5 } = require("../controllers/getPM2_5");
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
    for (var i = 0; i < response.data.routes.length; i++) {
      try {
        const formattedRoute = await formatData(response.data.routes[i]);
        result = [...result, formattedRoute];
      } catch (err) {
        console.log(err);
      }
    }
    res.json(result).status(200);
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
const getColor = (time) => {
  if (time <= 15 * 60) return "green";
  else if (time <= 30 * 60) return "blue";
  else if (time <= 45 * 60) return "orange";
  else if (time <= 60 * 60) return "brown";
  else return "red";
};
const getPMColor = (valuepm) => {
  if (valuepm <= 60) return "green";
  else if (valuepm <= 90) return "yellow";
  else if (valuepm <= 120) return "orange";
  else if (valuepm <= 250) return "red";
  else return "brown";
};
async function formatData(route) {
  let routeData = [];
  for (let i = 0; i < route.sections.length; i++) {
    try {
      const pm1 = await getPM2_5(
        route.sections[i].departure.place.location.lat,
        route.sections[i].departure.place.location.lng
      );
      const pm2 = await getPM2_5(
        route.sections[i].arrival.place.location.lat,
        route.sections[i].arrival.place.location.lng
      );
      const pmValue = (pm1 + pm2) / 2;
      // console.log(pmvalue);
      let travelTime = route.sections[i].travelSummary.duration;
      const sec = {
        travelTime,
        distance: route.sections[i].travelSummary.length,
        color: getColor(travelTime),
        pmValue,
        pmColor: getPMColor(pmValue),
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
  return routeData;
}

module.exports = getTravelData;
