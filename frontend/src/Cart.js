import React, { useState } from "react";
import axios from "axios"

const Cart = ({ cart }) => {
  const [address, setAddress] = useState("");
  const [totalFiat, setTotalFiat] = useState(0);
  const [totalCrypto, setTotalCrypto] = useState(0);


  const handleCheckout = async () => {
    const products = cart.map((product) => ({
      productId: product._id,
      quantity: product.quantity,
    }));

    const {data} = await axios.post("/api/orders", {products})
    setAddress(data.address);
    setTotalFiat(data.totalFiat);
    setTotalCrypto(data.totalCrypto);
  }

  return (
    <div>
      <h2>Cart</h2>
      {cart.map((product, index) => (
        <div key={index}>
          <span>{product.name}</span>
          <span>
            {" "}
            - ${product.price} x {product.quantity}
          </span>
        </div>
      ))}
      <button onClick={handleCheckout}>Checkout</button>
      {
        address && (
          <div>
          <p>Send payment to: {address}</p>
          <p>
            Total: ${totalFiat.toFixed(2)} or {totalCrypto.toFixed(8)} BTC
          </p>
        </div>
        )
      }
    </div>
  );
};

export default Cart