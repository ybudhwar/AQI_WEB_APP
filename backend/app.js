const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
var bodyParser = require("body-parser");
const routes = require("./routes");
const updateDatabase = require("./controllers/getPM2_5").updateDatabase;

require("dotenv").config();

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());

// Update Database regularly
updateDatabase();
setInterval(updateDatabase, 10000); // update pm2_5 database every 10 seconds

app.use("/", routes);

app.get("/", (req, res) => res.json({ msg: "API initialized" }).status(200));
app.use((req, res) => {
  res.status(400).json({
    msg: "The endpoint you are looking for is not there! Have a good day:)",
  });
});
module.exports = app;
