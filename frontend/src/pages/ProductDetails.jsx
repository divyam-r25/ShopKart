import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getProduct, addWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function ProductDetails({ user, setUser }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(false);
  const [cartState, setCartState] = useState("idle"); // idle | saving | added | error
  const [wishState, setWishState] = useState("idle"); // idle | saving | added | exists | error
  const { add } = useCart();

  useEffect(() => {
    getProduct(id)
      .then(({ data }) => setProduct(data.product))
      .catch(() => setError(true));
  }, [id]);

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

  const handleAddToWishlist = async () => {
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

  const cartLabel = () => {
    if (!product.stock) return "Out of stock";
    if (cartState === "saving") return "Adding to cart…";
    if (cartState === "added") return "Added to cart ✓";
    if (cartState === "error") return "Try again";
    return "Add to cart  +";
  };

  const wishLabel = () => {
    if (wishState === "saving") return "Saving…";
    if (wishState === "added") return "♥ Saved to wishlist";
    if (wishState === "exists") return "♥ Already in wishlist";
    if (wishState === "error") return "Unable to save. Try again";
    return "Save to wishlist ♡";
  };

  if (error) {
    return (
      <>
        <Navbar user={user} setUser={setUser} />
        <div className="state detail-state">
          <h3>We couldn't find that product.</h3>
          <Link className="text-link" to="/products">
            ← Back to the shop
          </Link>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar user={user} setUser={setUser} />
        <div className="state detail-state">
          <div className="spinner" />
          <p>Opening the details…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <main className="details">
        <Link to="/products" className="back">
          ← Back to the collection
        </Link>
        <section className="detail-grid">
          <div className="detail-image">
            <img src={product.image} alt={product.name} />
            <span>{product.category}</span>
          </div>
          <div className="detail-copy">
            <p className="eyebrow accent">{product.category}</p>
            <h1>{product.name}</h1>
            <p className="detail-price">{money.format(product.price)}</p>
            <div className="rule" />
            <p className="description">{product.description}</p>
            <p className={product.stock ? "availability" : "availability no-stock"}>
              {product.stock
                ? `${product.stock} pieces currently available`
                : "Currently unavailable"}
            </p>
            <button
              className="primary-btn add-cart"
              disabled={!product.stock || cartState === "saving"}
              onClick={handleAddToCart}
            >
              {cartLabel()}
            </button>
            <button
              className="secondary-btn"
              disabled={wishState === "saving" || wishState === "added" || wishState === "exists"}
              onClick={handleAddToWishlist}
            >
              {wishLabel()}
            </button>
            <p className="fine-print">Complimentary delivery on orders over ₹1,500.</p>
          </div>
        </section>
      </main>
    </>
  );
}
