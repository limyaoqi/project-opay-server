const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const Product = require("../models/Product");

router.get("/", auth, async (req, res) => {
  try {
    let orders = await Order.find({ user: req.user._id }).populate(
      "items.product"
    );
    if (!orders) return res.json({ msg: "You dont have order" });
    return res.json(orders);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.get("/all", auth, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      res.status(401).json({ msg: "You are not allowed to visit this page" });
    }
    let orders = await Order.find();
    if (!orders) return res.json({ msg: "You dont have order" });
    return res.json(orders);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      let myOrder = await Order.create({
        user: req.user._id,
        items: cart.items,
        total: cart.total,
      });

      await myOrder.save();

      for (const item of cart.items) {
        const product = await Product.findById(item.product);
        if (product) {
          // Update the quantity of the product
          product.quantity -= item.quantity;
          await product.save();
        }
      }

      await Cart.findByIdAndDelete(cart._id);
      return res.json({ msg: "Checkout successfully" });
    } else {
      return res.json({ msg: "Your cart is empty" });
    }
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

module.exports = router;
