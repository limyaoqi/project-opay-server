const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

router.post("/:id", auth, async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.json({ msg: "Product not found" });
    }
    let comment = await Comment.create({
      content: req.body.content,
      product: req.params.id,
      user: req.user._id,
    });

    product.comments.push({ comment: comment._id });
    await product.save();
    return res.json({ comment, msg: "Comment added successfully" });
  } catch (e) {
    return res.status(400).json({
      error: e.message,
      msg: "Cannot add a comment, Please try again later.",
    });
  }
});

//delete all comment
router.delete("/all/:id", auth, async (req, res) => {
    try {
      let product = await Product.findById(req.params.id)
      if (product.user != req.user._id) {
        if (!req.user.isAdmin) {
          return res.status(401).json({ msg: "You do not own this product" });
        }
      }
    
      await Comment.deleteMany({product: req.params.id});
      product.comments = []
      await product.save()
      return res.json({ product, msg: "Comment deleted successfully" });
    } catch (e) {
      return res
        .status(400)
        .json({ error: e.message, msg: "Something went wrong" });
    }
  });

//delete one comment
router.delete("/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.json({ msg: "Comment not found" });
    if (comment.user != req.user._id) {
      if (!req.user.isAdmin) {
        return res.status(401).json({ msg: "You do not own this comment" });
      }
    }
    let product = await Product.findByIdAndUpdate(
      comment.product,
      { $pull: { comments: { comment: { _id: req.params.id } } } },
      { new: true }
    );
    await Comment.findByIdAndDelete(req.params.id);
    return res.json({ product, msg: "Comment deleted successfully" });
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message, msg: "Something went wrong" });
  }
});

module.exports = router;
