const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const routes = require("./routes");
const updateDatabase = require("./controllers/getPM2_5").updateDatabase;

require("dotenv").config();

const app = express();

app.use(morgan('dev'));
app.use(cors());

// Update Database regularly
updateDatabase();
setInterval(updateDatabase,1800000) // update pm2_5 database every 30 minutes

app.use("/", routes);

app.get("/", (req, res) => res.json({ msg: "API initialized" }).status(200));

module.exports = app;
