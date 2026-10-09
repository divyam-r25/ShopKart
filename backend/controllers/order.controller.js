const crypto = require("crypto");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

const validId = (id) => mongoose.Types.ObjectId.isValid(id);
const shippingIsValid = (address = {}) => {
  const fields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
  return fields.every((field) => typeof address[field] === "string" && address[field].trim()) && /^\d{10}$/.test(address.phone.trim()) && /^\d{6}$/.test(address.pincode.trim());
};
const cleanAddress = (address) => Object.fromEntries(Object.entries(address).map(([key, value]) => [key, value.trim()]));
const razorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    const error = new Error("Razorpay test keys are not configured on the server");
    error.statusCode = 503;
    throw error;
  }
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};

exports.createPaymentOrder = async (req, res, next) => {
  try {
    if (!shippingIsValid(req.body.shippingAddress)) return res.status(400).json({ success: false, message: "Provide a valid shipping address, 10-digit phone, and 6-digit pincode" });
    const customer = await Customer.findById(req.user._id);
    if (!customer.cart.length) return res.status(400).json({ success: false, message: "Your cart is empty" });
    const productIds = customer.cart.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const byId = new Map(products.map((product) => [product._id.toString(), product]));
    const items = customer.cart.map((cartItem) => {
      const product = byId.get(cartItem.product.toString());
      if (!product) { const error = new Error("A product in your cart is no longer available"); error.statusCode = 400; throw error; }
      if (cartItem.quantity > product.stock) { const error = new Error(`Insufficient stock for ${product.name}`); error.statusCode = 400; throw error; }
      return { product: product._id, name: product.name, price: product.price, quantity: cartItem.quantity, image: product.image };
    });
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({ user: customer._id, items, shippingAddress: cleanAddress(req.body.shippingAddress), totalAmount });
    try {
      const payment = await razorpayClient().orders.create({ amount: Math.round(totalAmount * 100), currency: "INR", receipt: order._id.toString() });
      order.razorpayOrderId = payment.id;
      await order.save();
      res.status(201).json({ success: true, shopKartOrderId: order._id, razorpayOrderId: payment.id, amount: payment.amount, currency: payment.currency, key: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
      await Order.findByIdAndDelete(order._id);
      throw error;
    }
  } catch (error) { next(error); }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!validId(shopKartOrderId) || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ success: false, message: "Complete payment details are required" });
    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.paymentStatus === "PAID") return res.json({ success: true, message: "Payment already verified", order });
    if (order.razorpayOrderId !== razorpay_order_id) return res.status(400).json({ success: false, message: "Payment order does not match" });
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${order.razorpayOrderId}|${razorpay_payment_id}`).digest("hex");
    const received = Buffer.from(razorpay_signature);
    const expectedBuffer = Buffer.from(expected);
    if (received.length !== expectedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, received)) return res.status(400).json({ success: false, message: "Invalid payment signature" });
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();
    await Customer.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });
    res.json({ success: true, message: "Payment verified and order placed", order });
  } catch (error) { next(error); }
};

exports.getOrders = async (req, res, next) => {
  try { res.json({ success: true, orders: await Order.find({ user: req.user._id }).sort({ createdAt: -1 }) }); } catch (error) { next(error); }
};
exports.getOrder = async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid order ID" });
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (error) { next(error); }
};
