const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const validId = (id) => mongoose.Types.ObjectId.isValid(id);
const populatedCart = (id) => Customer.findById(id).populate("cart.product", "name price category image stock");
const responseCart = (customer) => customer.cart.filter((item) => item.product);

exports.getCart = async (req, res, next) => {
  try { res.json({ success: true, cart: responseCart(await populatedCart(req.user._id)) }); } catch (error) { next(error); }
};

exports.addCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!validId(productId)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const customer = await Customer.findById(req.user._id);
    const item = customer.cart.find((entry) => entry.product.equals(productId));
    const nextQuantity = item ? item.quantity + 1 : 1;
    if (nextQuantity > product.stock) return res.status(400).json({ success: false, message: `Only ${product.stock} unit(s) of ${product.name} are available` });
    if (item) item.quantity = nextQuantity; else customer.cart.push({ product: productId, quantity: 1 });
    await customer.save();
    res.json({ success: true, message: "Cart updated", cart: responseCart(await populatedCart(customer._id)) });
  } catch (error) { next(error); }
};

exports.updateCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    if (!validId(productId)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ success: false, message: "Quantity must be a whole number of at least 1" });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    if (quantity > product.stock) return res.status(400).json({ success: false, message: `Only ${product.stock} unit(s) are available` });
    const customer = await Customer.findById(req.user._id);
    const item = customer.cart.find((entry) => entry.product.equals(productId));
    if (!item) return res.status(404).json({ success: false, message: "Product is not in your cart" });
    item.quantity = quantity;
    await customer.save();
    res.json({ success: true, message: "Cart updated", cart: responseCart(await populatedCart(customer._id)) });
  } catch (error) { next(error); }
};

exports.removeCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!validId(productId)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    const customer = await Customer.findById(req.user._id);
    if (!customer.cart.some((entry) => entry.product.equals(productId))) return res.status(404).json({ success: false, message: "Product is not in your cart" });
    customer.cart = customer.cart.filter((entry) => !entry.product.equals(productId));
    await customer.save();
    res.json({ success: true, message: "Product removed from cart", cart: responseCart(await populatedCart(customer._id)) });
  } catch (error) { next(error); }
};
