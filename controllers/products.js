const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const multer = require("multer"); //handle file upload
const fs = require("fs"); //allows you to read and write on the file system
const path = require("path"); //allows you to change directors
const { createRequire } = require("module");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public");
  }, //where to save the images
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }, //format the fillname before storing it
});

const upload = multer({ storage });

router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    let product = new Product(req.body);
    product.user = req.user._id;
    product.image = req.file.filename;
    product.save();
    return res.json({ product, msg: "Product added Successfully" });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate({
      path: "comments.comment",
      select: "-__v",
    });
    return res.json(products);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// router.get("/:category", async (req, res) => {
//   try {
//     const products = await Product.find({
//       category: req.params.category,
//     }).populate({ path: "comments.comment", select: "-__v" });
//     return res.json(products);
//   } catch (e) {
//     return res.status(400).json({ error: e.message });
//   }
// });

router.get("/search/:name", async (req, res) => {
  try {
    const searchTerm = req.params.name;

    // Create a regular expression to match products containing the search term
    const regex = new RegExp(searchTerm, "i"); // "i" flag for case-insensitive matching

    // Find products whose names match the search term
    const products = await Product.find({ name: regex });

    if (products.length === 0) {
      return res.json({ msg: "No products found matching the search term" });
    }

    return res.json(products);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get("/myproducts", auth, async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id });
    return res.json(products);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: "comments.comment",
        select: "-__v",
      })
      .populate({
        path: "comments.comment",
        populate: { path: "user", select: "-password -fullname" },
      });

    if (!product) return res.json({ msg: "Product not found" });
    return res.json(product);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (req.user._id != product.user) {
      if (!req.user.isAdmin) {
        res
          .status(401)
          .json({ msg: "You are not allowed to delete this Product" });
      }
    }
    if (!product) return res.json({ msg: "Product not found" });
    if (product.image) {
      const filename = product.image;
      const filepath = path.join(__dirname, "../public/" + filename);
      fs.unlinkSync(filepath);
    }

    await Product.findByIdAndDelete(req.params.id);
    return res.json({ msg: "Product deleted succesfully." });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.json({ msg: "Product not found" });
    if (req.user._id != product.user) {
      if (!req.user.isAdmin) {
        res.status(401).json({ msg: "You are not allowed to do this action" });
      }
    }
    if (req.file && product.image) {
      const filename = product.image;
      const filepath = path.join(__dirname, "../public/" + filename);
      fs.unlinkSync(filepath);
    }
    const newProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        image: req.file ? req.file.filename : product.image,
      },
      {
        new: true,
      }
    );
    return res.json({
      product: newProduct,
      msg: "Product updated succesfully.",
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

module.exports = router;
