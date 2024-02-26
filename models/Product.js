const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, require: true },
  price: { type: Number, require: true },
  description: { type: String, require: true },
  quantity: { type: Number, require: true },
  category: { type: String, require: true },
  image: { type: String },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  comments: [
    {
      comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
      _id: false,
    },
  ],

  likes: [
    {
      liker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like",
      },
      _id: false,
    },
  ],
  created_at: { type: Date, default: Date.now() },
  updated_at: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("Product", ProductSchema);
