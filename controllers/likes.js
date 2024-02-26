const express = require("express");
const router = express.Router();
const Like = require("../models/Like");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

//localhost:1111/likes/productId
router.post("/:id", auth, async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.json({ msg: "Product not found" });

    let like = await Like.findOne({ user: req.user._id, product: req.params.id });
    if (!like) {
      let liker = await Like.create({
        product: req.params.id,
        user: req.user._id,
      });
      product.likes.push({ liker: liker.user });
      await product.save();
      return res.json({ product, msg: "like a product." });
    } else {
      let product = await Product.findByIdAndUpdate(
        req.params.id,
        {
          $pull: {
            likes: { liker: { _id: req.user._id, product: req.params.id } },
          },
        },
        { new: true }
      );
      await Like.findOneAndDelete({ user: req.user._id, product: req.params.id });
      return res.json({ product, msg: "unlike a product." });
    }
  } catch (e) {
    return res
      .status(400)
      .json({ error: e.message, msg: "Cannot get all product" });
  }
});

module.exports = router;
