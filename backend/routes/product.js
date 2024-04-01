const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

router.get("/:id", async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
  });
  res.json(product);
});

router.post("/", async (req, res) => {
  const { name, description, price } = req.body;
  const product = new Product({ name, description, price });
  const newProduct = product.save();
  res.json(newProduct);
});

router.put("/:id", async (req, res) => {
  const { name, description, price } = req.body;
  const product = await Product.findOne({
    _id: req.params.id,
  });

  if (name !== null) {
    product.name = name;
  }

  if (description !== null) {
    product.description = description;
  }

  if (price !== null) {
    product.price = price;
  }

  const updatedProduct = await product.save();

  res.json(updatedProduct);
});

router.delete("/:id", async (req, res) => {
  const product = await Product.findOneAndDelete({
    _id: req.params.id,
  });
  res.json(product);
});

module.exports = router;
