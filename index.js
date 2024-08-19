require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const Ip = require("./src/mongoose.js");
const requestIp = require("request-ip");
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");

app.use(express.json());
app.use(cors());
app.use(requestIp.mw());

mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", async (req, res) => {
  try {
    const ipAddress = await Ip.find();
    res.setHeader("Content-Type", "application/json");
    res.json(ipAddress);
  } catch (error) {
    console.error("Error retrieving IPs:", error);
    res.sendStatus(500);
  }
});

app.post("/", async (req, res) => {
  try {
    const clientIp = req.clientIp;
    console.log(clientIp, "client ip");

    await Ip.create({ ipAddress: clientIp });

    res.sendStatus(200);
  } catch (error) {
    console.error("Error saving IP:", error);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log("Server is listening on port", PORT);
});
