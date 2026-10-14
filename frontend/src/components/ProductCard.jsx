import { Link } from "react-router-dom";
import { useState } from "react";
import { addWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function ProductCard({ product }) {
  const soldOut = product.stock === 0;
  const { add } = useCart();

  // "idle" | "saving" | "added" | "exists" | "error"
  const [wishState, setWishState] = useState("idle");
  // "idle" | "saving" | "added" | "error"
  const [cartState, setCartState] = useState("idle");

  const handleWishlist = async () => {
    if (wishState === "saving" || wishState === "added" || wishState === "exists") return;
    setWishState("saving");
    try {
      await addWishlist(product._id);
      setWishState("added");
    } catch (err) {
      if (err?.response?.status === 409) {
        setWishState("exists");
      } else {
        setWishState("error");
      }
    }
  };

  const handleAddToCart = async () => {
    if (cartState === "saving") return;
    setCartState("saving");
    try {
      await add(product._id);
      setCartState("added");
    } catch {
      setCartState("error");
    }
  };

  const wishLabel = () => {
    if (wishState === "saving") return "⏳ Saving…";
    if (wishState === "added") return "♥ Added to Wishlist";
    if (wishState === "exists") return "♥ In Wishlist";
    if (wishState === "error") return "Unable to save. Retry";
    return "♡ Wishlist";
  };

  const cartLabel = () => {
    if (cartState === "saving") return "Adding…";
    if (cartState === "added") return "Added ✓";
    if (cartState === "error") return "Try again";
    return "Add to cart";
  };

  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`} className="product-image">
        <img src={product.image} alt={product.name} />
        <span className="category-pill">{product.category}</span>
        {soldOut && <span className="sold-out">Sold out</span>}
      </Link>

      <div className="product-info">
        <div>
          <p className="eyebrow">{product.category}</p>
          <h3>{product.name}</h3>
        </div>
        <p className="price">{money.format(product.price)}</p>
        <div className="product-foot">
          <span className={soldOut ? "stock sold" : "stock"}>
            {soldOut ? "Unavailable" : `${product.stock} in stock`}
          </span>
          <Link to={`/products/${product._id}`} className="arrow-link">
            View <b>→</b>
          </Link>
        </div>
        <div className="card-actions">
          <button
            className="text-button"
            disabled={
              wishState === "saving" ||
              wishState === "added" ||
              wishState === "exists"
            }
            onClick={handleWishlist}
          >
            {wishLabel()}
          </button>
          <button
            className="text-button"
            disabled={soldOut || cartState === "saving"}
            onClick={handleAddToCart}
          >
            {cartLabel()}
          </button>
        </div>
      </div>
    </article>
  );
}
