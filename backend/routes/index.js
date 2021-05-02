const express = require("express");
const router = express.Router();
const getTravelData = require("../views/travelData");
const pollutionViews = require("../views/pollution");

router.get("/aqi/:id/", pollutionViews.getPollutionData);

router.get("/gettraveldata/:query", getTravelData);

router.get("/getPMData/:lat/:lng", pollutionViews.getPMData);

module.exports = router;
