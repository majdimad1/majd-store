import { useEffect, useState } from "react";

function App() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [apiMessage, setApiMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [orderMessage, setOrderMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((response) => response.json())
      .then((data) => {
        setApiMessage(data.message);
      })
      .catch((error) => {
        console.error("Error connecting to backend:", error);
      });

    fetch("http://localhost:5000/api/products")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading products:", error);
        setLoading(false);
      });
  }, []);

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item._id === product._id
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });

    setOrderMessage("");
  };

  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item._id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item._id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item._id !== id)
    );
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const placeOrder = async () => {
    if (cart.length === 0) {
      setOrderMessage("Your cart is empty.");
      return;
    }

    try {
      const orderItems = cart.map((item) => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: orderItems,
          total: Number(total.toFixed(2)),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to place order");
      }

      setOrderMessage(
        `Order placed successfully! Order ID: ${data.order._id}`
      );

      setCart([]);
    } catch (error) {
      console.error("Error placing order:", error);
      setOrderMessage("Failed to place order. Please try again.");
    }
  };

  return (
    <div>
      <header>
        <h1>Majd Store</h1>

        <nav>
          <a href="/">Home</a>
          <a href="#products">Products</a>
          <a href="#cart">Cart ({cartCount})</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <h2>Discover Our Products</h2>

          <p>
            Quality products. Simple shopping. Fast and reliable.
          </p>

          <button
            onClick={() => {
              document
                .getElementById("products")
                .scrollIntoView({ behavior: "smooth" });
            }}
          >
            Shop Now
          </button>

          {apiMessage && <p>{apiMessage}</p>}
        </section>

        <section className="products" id="products">
          <h2>Featured Products</h2>

          {loading ? (
            <p>Loading products...</p>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <div className="product-card" key={product._id}>
                  <div className="product-image">
                    <img
                      src={product.image}
                      alt={product.name}
                    />
                  </div>

                  <h3>{product.name}</h3>

                  <p>{product.description}</p>

                  <strong>${product.price.toFixed(2)}</strong>

                  <button onClick={() => addToCart(product)}>
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="cart-section" id="cart">
          <h2>Your Cart</h2>

          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div className="cart-item" key={item._id}>
                  <span>{item.name}</span>

                  <strong>
                    ${(item.price * item.quantity).toFixed(2)}
                  </strong>

                  <div>
                    <button
                      onClick={() => decreaseQuantity(item._id)}
                    >
                      −
                    </button>

                    <span style={{ margin: "0 12px" }}>
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => increaseQuantity(item._id)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <h3>Total: ${total.toFixed(2)}</h3>

              <button onClick={placeOrder}>
                Place Order
              </button>
            </>
          )}

          {orderMessage && (
            <p style={{ marginTop: "20px", fontWeight: "bold" }}>
              {orderMessage}
            </p>
          )}
        </section>
      </main>

      <footer>
        <p>© 2026 Majd Store</p>
      </footer>
    </div>
  );
}

export default App;