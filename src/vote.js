const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  color: {
    type: String,
    enum: ["green", "red"],
    required: true,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Vote = mongoose.model("Vote", voteSchema);

module.exports = Vote;
