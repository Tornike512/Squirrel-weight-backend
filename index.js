require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const Ip = require("./src/mongoose.js");
const requestIp = require("request-ip");
const mongoose = require("mongoose");
const Vote = require("./src/color.js");

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(requestIp.mw());

let isConnected = false;

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
    await mongoose.connect(process.env.MONGODB_URI, {});
    isConnected = true;
  }
}

app.post("/", async (req, res) => {
  try {
    await ensureMongoDBConnection();
    const clientIp = req.clientIp;

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

app.post("/vote", async (req, res) => {
  try {
    await ensureMongoDBConnection();
    const { color, ipAddress } = req.body;
    const clientIp = req.clientIp;

    if (!color || !["green", "red"].includes(color)) {
      return res.status(400).send("Invalid color.");
    }

    // if (!ipAddress) {
    //   return res.status(400).send("IP address is required.");
    // }

    const existingVote = await Vote.findOne({ ipAddress });

    if (existingVote) {
      return res.status(400).send("You have already voted.");
    }

    const newVote = await Vote.create({ color, ipAddress });
    const newIp = await Ip.create({ ipAddress: clientIp });

    const formattedResponse = {
      _id: newVote._id.toString(),
      color: newVote.color,
      ipAddress: Ip.ipAddress,
      timestamp: newVote.timestamp.toISOString(),
      __v: newVote.__v,
    };

    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error("Error Voting:", error);
    res.sendStatus(500);
  }
});

app.get("/vote", async (req, res) => {
  try {
    await ensureMongoDBConnection();
    const votes = await Vote.find();
    res.setHeader("Content-Type", "application/json");
    res.json(votes);
  } catch (error) {
    console.error("Error retrieving votes:", error);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
