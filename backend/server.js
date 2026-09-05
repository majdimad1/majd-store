const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Order = require("./models/Order");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==================== PRODUCT SCHEMA ====================

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

// ==================== DATABASE CONNECTION ====================

let mongoConnection = null;

async function connectToMongoDB() {
  if (mongoConnection) {
    return mongoConnection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not configured.");
  }

  mongoConnection = mongoose.connect(process.env.MONGO_URI);

  try {
    await mongoConnection;
    console.log("MongoDB connected successfully!");

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

    return mongoConnection;
  } catch (error) {
    mongoConnection = null;
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}

// ==================== TEST ROUTE ====================

app.get("/", async (req, res) => {
  res.json({
    message: "Majd Store API is running successfully!",
  });
});

// ==================== GET PRODUCTS ====================

app.get("/api/products", async (req, res) => {
  try {
    await connectToMongoDB();

    const products = await Product.find();

    res.status(200).json(products);
  } catch (error) {
    console.error("Error loading products:", error.message);

    res.status(500).json({
      message: "Error loading products",
      error: error.message,
    });
  }
});

// ==================== CREATE ORDER ====================

app.post("/api/orders", async (req, res) => {
  try {
    await connectToMongoDB();

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
    console.error("Error creating order:", error.message);

    res.status(500).json({
      message: "Error creating order",
      error: error.message,
    });
  }
});

// ==================== GET ORDERS ====================

app.get("/api/orders", async (req, res) => {
  try {
    await connectToMongoDB();

    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error loading orders:", error.message);

    res.status(500).json({
      message: "Error loading orders",
      error: error.message,
    });
  }
});

// ==================== VERCEL EXPORT ====================

// IMPORTANT:
// Vercel needs the Express application exported.
module.exports = app;

// ==================== LOCAL DEVELOPMENT ====================

// Only start a local server when running directly with Node.
// Vercel will use the exported app instead.
if (require.main === module) {
  connectToMongoDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Majd Store API running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Failed to start server:", error.message);
    });
}