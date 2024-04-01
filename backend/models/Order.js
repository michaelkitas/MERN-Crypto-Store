const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
    },
  ],
  totalFiat: { type: Number, required: true },
  totalCrypto: { type: Number, required: true },
  paidCrypto: { type: Number, required: false },
  status: {
    type: String,
    default: "Pending",
    enum: ['Pending', 'Success', 'Failed', 'Partially Paid']
  },
  transactionId: { type: String, required: false },
  address: { type: String, required: true },
})

module.exports = mongoose.model('Order', orderSchema)