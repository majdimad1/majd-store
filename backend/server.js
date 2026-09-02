const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Order = require("./models/Order");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Product schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Majd Store API is running successfully!",
  });
});

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Error loading products",
      error: error.message,
    });
  }
});

// Create a new order
app.post("/api/orders", async (req, res) => {
  try {
    const { items, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    if (typeof total !== "number") {
      return res.status(400).json({
        message: "Invalid order total",
      });
    }

    const order = new Order({
      items,
      total,
    });

    const savedOrder = await order.save();

    res.status(201).json({
      message: "Order created successfully!",
      order: savedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating order",
      error: error.message,
    });
  }
});

// Get all orders
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Error loading orders",
      error: error.message,
    });
  }
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected successfully!");

    // Add sample products if collection is empty
    const productCount = await Product.countDocuments();

    if (productCount === 0) {
      await Product.insertMany([
        {
          name: "Wireless Headphones",
          price: 79.99,
          description:
            "High-quality wireless headphones with clear sound.",
          image:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Smart Watch",
          price: 129.99,
          description:
            "Modern smartwatch with fitness and notification features.",
          image:
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Mechanical Keyboard",
          price: 89.99,
          description:
            "Responsive mechanical keyboard for work and gaming.",
          image:
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
        },
      ]);

      console.log("Sample products added to MongoDB!");
    }

    app.listen(PORT, () => {
      console.log(`Majd Store API running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });