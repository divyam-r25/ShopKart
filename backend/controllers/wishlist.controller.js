const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.addWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!validId(productId)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    if (!await Product.exists({ _id: productId })) return res.status(404).json({ success: false, message: "Product not found" });
    const customer = await Customer.findById(req.user._id);
    if (customer.wishlist.some((id) => id.equals(productId))) return res.status(409).json({ success: false, message: "Product is already in your wishlist" });
    customer.wishlist.push(productId);
    await customer.save();
    res.status(201).json({ success: true, message: "Product added to wishlist" });
  } catch (error) { next(error); }
};

exports.getWishlist = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.user._id).populate("wishlist", "name price category image stock");
    const wishlist = customer.wishlist.filter(Boolean);
    res.json({ success: true, count: wishlist.length, wishlist });
  } catch (error) { next(error); }
};

exports.removeWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!validId(productId)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    const customer = await Customer.findById(req.user._id);
    if (!customer.wishlist.some((id) => id.equals(productId))) return res.status(404).json({ success: false, message: "Product is not in your wishlist" });
    customer.wishlist = customer.wishlist.filter((id) => !id.equals(productId));
    await customer.save();
    res.json({ success: true, message: "Product removed from wishlist" });
  } catch (error) { next(error); }
};
