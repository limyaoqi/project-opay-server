const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: "User" },
    product: { type: mongoose.Schema.Types.ObjectId, required: "Product" },
  });

module.exports = mongoose.model("Like", LikeSchema);