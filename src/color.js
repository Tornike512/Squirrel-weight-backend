const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema({
  color: {
    type: String,
    required: false,
  },
  ipAddress: {
    Type: String,
  },
  timestamp: { type: Date, default: Date.now },
});

const Vote = mongoose.model("Vote", VoteSchema);

module.exports = Vote;
