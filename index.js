require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const Ip = require("./src/mongoose.js");
const requestIp = require("request-ip");
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const Vote = require("./src/vote.js");

app.use(express.json());
app.use(cors());
app.use(requestIp.mw());

let isConnected;

mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => {
    console.log("MongoDB connected");
    isConnected = true;
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    isConnected = false;
  });

async function ensureMongoDBConnection() {
  if (!isConnected) {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
  }
}

app.get("/", async (req, res) => {
  try {
    await ensureMongoDBConnection();
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
    await ensureMongoDBConnection();
    const clientIp = req.clientIp;
    console.log(clientIp, "client ip");
    const existingIp = await Ip.findOne({ ipAddress: clientIp });

    if (!existingIp) {
      await Ip.create({ ipAddress: clientIp });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error saving IP:", error);
    res.sendStatus(500);
  }
});

app.get("/vote", async (req, res) => {
  await ensureMongoDBConnection();
  const color = await Vote.find();
  res.setHeader("Content-Type", "application/json");
  res.json(color);
});

app.post("/vote", async (req, res) => {
  await ensureMongoDBConnection();
  const { color } = req.body;

  if (!["green", "red"].includes(color)) {
    return res.status(400).json({ message: "Invalid color choice" });
  }

  try {
    const existingColor = await Vote.findOne({ color });

    if (!existingColor) {
      const newVote = new Vote({ color });
      await newVote.save();
    }

    res.status(201).json({ message: "Vote recorded successfully" });
  } catch (error) {
    console.error("Error saving vote:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log("listening");
});
