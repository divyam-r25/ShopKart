require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "replace-with-a-long-random-secret") {
  throw new Error("JWT_SECRET must be configured with a unique secret before starting the server");
}

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = !origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || origin === process.env.CLIENT_URL;
  if (allowed && origin) {
    res.header("Access-Control-Allow-Origin", origin);
  } else if (!origin) {
    res.header("Access-Control-Allow-Origin", "*");
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.get("/", (req, res) => res.json({ success: true, message: "ShopKart API is running" }));
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Something went wrong. Please try again.";
  res.status(status).json({ success: false, message });
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`ShopKart API running at http://localhost:${PORT}`));
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
}
startServer();
