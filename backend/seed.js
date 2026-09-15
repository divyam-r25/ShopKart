require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/product.model");

const products = [
  { name: "Quiet Hours Headphones", description: "Immersive wireless headphones with deep, balanced sound and a soft memory-foam fit.", price: 4999, category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85", stock: 18 },
  { name: "The Everyday Tote", description: "A generously sized canvas carry-all for market mornings, office days, and spontaneous weekends.", price: 1799, category: "Fashion", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85", stock: 12 },
  { name: "The Art of Stillness", description: "A beautiful hardback about finding meaningful pauses in a busy, bright world.", price: 899, category: "Books", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85", stock: 27 },
  { name: "Hand-thrown Morning Mug", description: "A tactile stoneware mug with a gentle speckle glaze—made for unhurried first sips.", price: 1199, category: "Home", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85", stock: 9 },
  { name: "Pocket Film Camera", description: "A charming reusable 35mm camera that makes everyday scenes feel like treasured memories.", price: 3299, category: "Electronics", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85", stock: 6 },
  { name: "Linen Wind Shirt", description: "An easy, breathable layer cut from washed linen in a warm, understated neutral.", price: 2499, category: "Fashion", image: "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=900&q=85", stock: 14 }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log("ShopKart products seeded successfully.");
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}
seed();
