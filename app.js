const express = require("express");

const app = express();
const port = process.env.PORT || "8000";

app.get("/", (req, res) => {
  return res.json({ msg: "API initialized" }).status(200);
});

app.listen(port, () => {
  console.log(`Server listening on PORT ${port}`);
});
