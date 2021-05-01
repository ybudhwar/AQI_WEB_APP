const express = require("express");
const router = express.Router();
const getTravelData = require("../views/travelData");
const pollutionViews = require("../views/pollution");
const calculateCongestion = require("../views/congestion");

router.get("/aqi/:id/", pollutionViews.getPollutionData);

router.get("/gettraveldata/:query", getTravelData);
router.post("/getCongestion", calculateCongestion);

module.exports = router;
