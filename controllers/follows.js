const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

router.post("/:id", auth, async (req, res) => {
  try {
    let userToFollow = await User.findById(req.params.id); //the guy i want to follow
    let currentUser = await User.findById(req.user._id);
    if (!userToFollow) return res.json({ msg: "User not found" });

    // let follow = await User.findOne({ following: req.params.id });
    // console.log(userToFollow.followers.findOne({ follower: req.user._id }));
    let isFollowing = userToFollow.followers.find(
      (follower) => JSON.stringify(follower.follower) == `"${req.user._id}"`
    );
    if (!isFollowing) {
      currentUser.followings.push({
        following: userToFollow._id,
      });
      userToFollow.followers.push({
        follower: currentUser._id,
      });
      await currentUser.save();
      await userToFollow.save();
      return res.json({ currentUser, msg: "You are following the user now." });
    } else {
      currentUser.followings.pull({
        following: userToFollow._id,
      });
      userToFollow.followers.pull({
        follower: currentUser._id,
      });
      await currentUser.save();
      await userToFollow.save();
      return res.json({ currentUser, msg: "Unfollow a user." });
    }
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message, msg: "Cannot get all follower and following" });
  }
});

router.get("/follower", auth, async (req, res) => {
  try {
    const followers = await User.findById(req.user._id);
    if (!followers) return res.json({ msg: "You dont have follower" });
    return res.json(followers.followers);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.get("/following", auth, async (req, res) => {
  try {
    let following = await User.findById(req.user._id);
    if (!following) return res.json({ msg: "You didnt follow anyone." });
    return res.json(following.followings);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.get("/follower/:id", auth, async (req, res) => {
  try {
    let currentUser = await User.findById(req.user._id).populate(
      "followers.follower"
    );
    let follower = currentUser.followers.find(
      (f) => f.follower._id.toString() == req.params.id
    );
    if (!follower) return res.json({ msg: "Current user dont have follower" });
    return res.json(follower);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.get("/following/:id", auth, async (req, res) => {
  try {
    let currentUser = await User.findById(req.user._id).populate(
      "followings.following"
    );
    // console.log(currentUser.followings)
    // return
    let following = currentUser.followings.find(
      (f) => f.following._id.toString() == req.params.id
    );
    if (!following)
      return res.json({ msg: "Current user dont have follow anyone" });
    return res.json(following);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.delete("/follower/:id", auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    // const targetUser = await User.findById(req.params.id);

    if (!currentUser) {
      return res.status(404).json({ msg: "Current user not found" });
    }

    // if (!targetUser) {
    //   return res.status(404).json({ msg: "Target user not found" });
    // }

    currentUser.followers.pull({ follower: req.params.id });
    // targetUser.followings.pull({ following: req.user._id });

    await currentUser.save();
    // await targetUser.save();

    return res.json({ currentUser, msg: "Follower deleted successfully." });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

module.exports = router;
