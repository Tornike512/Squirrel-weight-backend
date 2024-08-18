const mongoose = require("mongoose");

const ipSchema = new mongoose.Schema({
  ipAddress: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Ip = mongoose.model("Ip", ipSchema);

module.exports = Ip;
