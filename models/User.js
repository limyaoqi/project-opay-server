const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullname: { type: String, require: true },
  username: { type: String, require: true },
  email: { type: String, require: true },
  password: { type: String },
  isAdmin: { type: Boolean, default: false },
  followers: [
    {
      follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      _id: false,
    },
  ],
  followings: [
    {
      following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      _id: false,
    },
  ],
});

module.exports = mongoose.model("User", UserSchema);
