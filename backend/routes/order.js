const express = require("express");
const axios = require("axios");
const Order = require("../models/Order");
const Product = require("../models/Product");
const router = express.Router();

const API_KEY = process.env.BCON_API_KEY;
const API_URL = "https://external-api.bcon.global/api/v1";

const bconAPI = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
});

router.post("/", async (req, res) => {
  const walletResponse = await bconAPI.post("/address");

  if (walletResponse.data.status !== "Ok") {
    return res
      .status(400)
      .json({ message: "Failed to generate Bitcoin address" });
  }

  const bitcoinAddress = walletResponse.data.data.address;

  const productsEntries = req.body.products;
  const productsIds = productsEntries.map((entry) => entry.productId);

  const products = await Product.find({
    _id: { $in: productsIds },
  });

  const isValidOrder = productsEntries.every(
    (entry) =>
      products.some((product) => product._id.toString() === entry.productId) &&
      entry.quantity > 0
  );

  if (!isValidOrder) {
    return res.status(400).json({ message: "Invalid product ID or quantity" });
  }

  const totalFiat = productsEntries.reduce((acc, entry) => {
    const product = products.find(
      (product) => product._id.toString() === entry.productId
    );
    return acc + product.price * entry.quantity;
  }, 0);

  const cryptoResponse = await bconAPI.get("/currencies/btc?currency=usd");

  if (cryptoResponse.data.status !== "Ok") {
    return res
      .status(400)
      .json({ message: "Failed to get cryptocurrency rate" });
  }

  const rate = cryptoResponse.data.data.price;
  const totalCrypto = parseFloat(totalFiat / rate).toFixed(8);

  const order = new Order({
    products: productsEntries.map((entry) => ({
      product: entry.productId,
      quantity: entry.quantity,
    })),
    totalFiat,
    totalCrypto,
    address: bitcoinAddress,
  });

  const newOrder = await order.save();
  res.status(201).json(newOrder);
});

router.get("/webhook", async (req, res) => {
  const { status, addr, value: stringValue, txid, secret } = req.query;

  // if (secret !== API_KEY) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }

  const valueInBTC = parseInt(stringValue, 10) / 10000000;

  const order = await Order.findOne({
    address: addr,
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  console.log(valueInBTC, "valueInBTC")
  console.log(order.totalCrypto, "order.totalCrypto")

  if (status === "2") {
    order.status =
      valueInBTC >= order.totalCrypto ? "Success" : "Partially Paid";
    order.transactionId = txid;
    order.paidCrypto = valueInBTC;
    await order.save();
  } else if (status === "1") {
    order.status = "Failed";
    order.transactionId = txid;
    order.paidCrypto = valueInBTC;
    await order.save();
  }

  return res.sendStatus(200);
});

router.get("/", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

router.get("/:id", async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
  });
  res.json(order);
});

module.exports = router;
