import { Link } from "react-router-dom";
import { useState } from "react";
import { addWishlist } from "../services/api";
import { useCart } from "../context/CartContext";
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export default function ProductCard({ product }) {
  const soldOut = product.stock === 0, { add } = useCart();
  const [wish, setWish] = useState(""), [cart, setCart] = useState("");
  const save = async () => { setWish("saving"); try { await addWishlist(product._id); setWish("added"); } catch { setWish("error"); } };
  const addItem = async () => { setCart("saving"); try { await add(product._id); setCart("added"); } catch { setCart("error"); } };
  return <article className="product-card"><Link to={`/products/${product._id}`} className="product-image"><img src={product.image} alt={product.name}/><span className="category-pill">{product.category}</span>{soldOut && <span className="sold-out">Sold out</span>}</Link><div className="product-info"><div><p className="eyebrow">{product.category}</p><h3>{product.name}</h3></div><p className="price">{money.format(product.price)}</p><div className="product-foot"><span className={soldOut ? "stock sold" : "stock"}>{soldOut ? "Unavailable" : `${product.stock} in stock`}</span><Link to={`/products/${product._id}`} className="arrow-link">View <b>→</b></Link></div><div className="card-actions"><button className="text-button" disabled={wish === "saving" || wish === "added"} onClick={save}>{wish === "saving" ? "Saving…" : wish === "added" ? "♥ Saved" : wish === "error" ? "Try again" : "♡ Wishlist"}</button><button className="text-button" disabled={soldOut || cart === "saving"} onClick={addItem}>{cart === "saving" ? "Adding…" : cart === "added" ? "Added ✓" : cart === "error" ? "Try again" : "Add to cart"}</button></div></div></article>;
}
