const express = require("express");
const app = express();
const requestIp = require("request-ip");
const PORT = process.env.PORT || 3000;
const cors = require("cors");
const mongoose = require("mongoose");
const Ip = require("./src/mongoose");

app.use(express.json());
app.use(cors());
app.use(requestIp.mw());

mongoose.connect("mongodb://localhost:27017/squirrel", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(async (req, res, next) => {
  try {
    await Ip.create({ ipAddress: req.clientIp });
    console.log("IP Address saved:", req.clientIp);
  } catch (error) {
    console.error("Error saving IP address:", error);
  }
  next();
});

app.get("/", (req, res) => {
  res.send(req.clientIp);
});

app.listen(PORT, () => {
  console.log("Listening");
});
