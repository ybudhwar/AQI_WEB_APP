const express = require("express");
const routes = require("./routes");

require("dotenv").config();

const app = express();
const port = process.env.PORT || "8000";

app.use("/", routes);

app.get("/", (req, res) => res.json({ msg: "API initialized" }).status(200));

app.listen(port, () => {
  console.log(`Server listening on PORT ${port}`);
});
