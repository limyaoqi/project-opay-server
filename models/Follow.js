const mongoose = require("mongoose");

const FollowSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: "User" },
    name: { type: mongoose.Schema.Types.ObjectId, required: "User" },
  });

module.exports = mongoose.model("Follow", FollowSchema);