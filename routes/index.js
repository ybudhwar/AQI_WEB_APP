const express = require("express");
const router = express.Router();

const pollutionViews = require("../views/pollution");

router.get("/aqi/:id/", pollutionViews.getPollutionData);

module.exports = router;
