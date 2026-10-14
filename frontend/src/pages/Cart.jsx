import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Cart({ user, setUser }) {
  const { cart, loading, error, refreshCart, update, remove } = useCart();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <>
        <Navbar user={user} setUser={setUser} />
        <div className="state">
          <div className="spinner" />
          <p>Loading your cart…</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar user={user} setUser={setUser} />
        <div className="state">
          <h3>Unable to load your cart.</h3>
          <p>Something went wrong. Please try again.</p>
          <button className="primary-btn" onClick={refreshCart}>
            Try Again
          </button>
        </div>
      </>
    );
  }

  if (!cart.length) {
    return (
      <>
        <Navbar user={user} setUser={setUser} />
        <div className="state">
          <h3>Your cart is empty 🛒</h3>
          <p>Looks like you haven't added anything yet.</p>
          <Link className="primary-btn" to="/products">
            Browse Products
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <main className="cart-page">
        <h1>Your cart</h1>
        <div className="cart-layout">
          <section>
            {cart.map(({ product, quantity }) => (
              <article className="cart-item" key={product._id}>
                <img src={product.image} alt={product.name} />
                <div>
                  <p className="eyebrow">{product.category}</p>
                  <h3>{product.name}</h3>
                  <p>{money.format(product.price)}</p>
                </div>
                <div className="quantity">
                  <button
                    onClick={() => quantity > 1 && update(product._id, quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button
                    disabled={quantity >= product.stock}
                    onClick={() => update(product._id, quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="text-button"
                  onClick={() => remove(product._id)}
                >
                  Remove
                </button>
              </article>
            ))}
          </section>

          <aside className="summary">
            <h2>Order summary</h2>
            <p>
              <span>Items</span>
              <b>{money.format(subtotal)}</b>
            </p>
            <p>
              <span>Delivery</span>
              <b>Free</b>
            </p>
            <div className="rule" />
            <p className="summary-total">
              <span>Total</span>
              <b>{money.format(subtotal)}</b>
            </p>
            <Link className="primary-btn" to="/checkout">
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      </main>
    </>
  );
}
