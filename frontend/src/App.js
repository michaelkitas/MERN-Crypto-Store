import React, { useState } from "react";
import Products from "./Products";
import Cart from "./Cart";

const App = () => {
  const [cart, setCart] = useState([]);

  const onAddCart = (productToAdd) => {
    const isProductInCart = cart.some(
      (product) => product._id === productToAdd._id
    );

    if (isProductInCart) {
      const updatedCart = cart.map((product) =>
        product._id === productToAdd._id
          ? {
              ...product,
              quantity: product.quantity + 1,
            }
          : product
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...productToAdd, quantity: 1 }]);
    }
  };

  return (
    <div>
      <Products onAddCart={onAddCart} />
      <Cart cart={cart} />
    </div>
  )
};

export default App;