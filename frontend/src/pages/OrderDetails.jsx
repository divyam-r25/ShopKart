import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrder } from "../services/api";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const statusLabel = (status) =>
  status ? status.replaceAll("_", " ") : "";

export default function OrderDetails({ user, setUser }) {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getOrder(id)
      .then(({ data }) => {
        setOrder(data.order);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <main className="cart-page">
        {loading && (
          <div className="state">
            <div className="spinner" />
            <p>Loading order details…</p>
          </div>
        )}

        {!loading && error && (
          <div className="state">
            <h3>We couldn't find that order.</h3>
            <p>It may have been removed or you don't have access to it.</p>
            <Link className="primary-btn" to="/orders">
              View My Orders
            </Link>
          </div>
        )}

        {!loading && order && (
          <section className="order-detail">
            {order.status === "PLACED" && (
              <p className="eyebrow accent">✅ ORDER CONFIRMED</p>
            )}
            <h1>
              {order.status === "PLACED"
                ? "Order placed successfully"
                : "Order details"}
            </h1>

            <p>
              <strong>Order ID:</strong> {order._id}
            </p>
            <p className="status">
              {statusLabel(order.status)} · {order.paymentStatus}
            </p>

            <div className="rule" />

            {order.items.map((item) => (
              <div className="order-line" key={item._id}>
                <span>
                  {item.name} × {item.quantity}
                </span>
                <b>{money.format(item.price * item.quantity)}</b>
              </div>
            ))}

            <div className="rule" />
            <h2>Total {money.format(order.totalAmount)}</h2>

            {order.shippingAddress && (
              <p>
                Delivering to {order.shippingAddress.addressLine1},{" "}
                {order.shippingAddress.city}, {order.shippingAddress.state} –{" "}
                {order.shippingAddress.pincode}
              </p>
            )}

            <div className="rule" />
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link className="primary-btn" to="/orders">
                View My Orders
              </Link>
              <Link className="secondary-btn" to="/products" style={{ display: "inline-block", textAlign: "center" }}>
                Continue Shopping
              </Link>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
