import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrders } from "../services/api";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const statusLabel = (status) =>
  status ? status.replaceAll("_", " ") : "";

const statusColor = (status) => {
  if (status === "PLACED" || status === "CONFIRMED") return "#4e7c42";
  if (status === "SHIPPED" || status === "DELIVERED") return "#153c33";
  if (status === "PENDING_PAYMENT") return "#8a6630";
  return "#718078";
};

export default function Orders({ user, setUser }) {
  const [orders, setOrders] = useState([]);
  const [state, setState] = useState("loading");

  const load = useCallback(async () => {
    setState("loading");
    try {
      const { data } = await getOrders();
      setOrders(data.orders || []);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <main className="cart-page">
        <h1>My orders</h1>

        {state === "loading" && (
          <div className="state">
            <div className="spinner" />
            <p>Loading your orders…</p>
          </div>
        )}

        {state === "error" && (
          <div className="state">
            <h3>Unable to load orders.</h3>
            <p>Something went wrong. Please try again.</p>
            <button className="primary-btn" onClick={load}>
              Try Again
            </button>
          </div>
        )}

        {state === "ready" && !orders.length && (
          <div className="state">
            <h3>You have not placed any orders yet.</h3>
            <p>Start shopping to see your order history here.</p>
            <Link className="primary-btn" to="/products">
              Start Shopping
            </Link>
          </div>
        )}

        {state === "ready" &&
          orders.map((order) => (
            <article className="order-card" key={order._id}>
              <div>
                <p className="eyebrow">Order #{order._id.slice(-8).toUpperCase()}</p>
                <h3>
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </h3>
                <p>
                  {order.items
                    .map((item) => `${item.name} × ${item.quantity}`)
                    .join(", ")}
                </p>
              </div>
              <div>
                <b>{money.format(order.totalAmount)}</b>
                <p className="status" style={{ color: statusColor(order.status) }}>
                  {statusLabel(order.status)} · {order.paymentStatus}
                </p>
                <Link className="text-link" to={`/orders/${order._id}`}>
                  View details →
                </Link>
              </div>
            </article>
          ))}
      </main>
    </>
  );
}
