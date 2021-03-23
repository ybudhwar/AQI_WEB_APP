const axios = require("axios");
const querystring = require("querystring");
const moment = require("moment");
const API_URL = "https://intermodal.router.hereapi.com/v8/routes";

function getTravelData(req, res) {
  let queryStr = req.params.query;
  let queryObj = querystring.parse(queryStr);
  let origin = queryObj.origin;
  let dest = queryObj.dest;

  let p = axios.get(API_URL, {
    params: {
      apiKey: process.env.api_key,
      alternatives: 10,
      destination: dest,
      origin: origin,
    },
  });
  p.then((response) => {
    let result = [];
    for (var i = 0; i < response.data.routes.length; i++) {
      result = [...result, formatData(response.data.routes[i])];
    }
    res.send(result);
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
function formatData(route) {
  let departurePlace = route.sections[0].departure.place;
  let arrivalPlace = route.sections[route.sections.length - 1].arrival.place;
  let startTime = route.sections[0].departure.time;
  let endTime = route.sections[route.sections.length - 1].arrival.time;
  let travelTime = moment
    .duration(
      moment(endTime, "YYYY/MM/DD HH:mm").diff(
        moment(startTime, "YYYY/MM/DD HH:mm")
      )
    )
    .asSeconds();
  //In seconds
  return {
    travelTime,
    departurePlace,
    arrivalPlace,
  };
}

module.exports = getTravelData;
