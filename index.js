const express = require("express");
const app = express();
const requestIp = require("request-ip");
const PORT = process.env.PORT || 3000;
const cors = require("cors");

app.use(express.json());
app.use(cors());

app.use(requestIp.mw());

app.use((req, res, next) => {
  console.log("IP Address:", req.clientIp);
  next();
});

app.get("/", (req, res) => {
  res.send(req.clientIp);
});

app.listen(PORT, () => {
  console.log("Listening");
});
