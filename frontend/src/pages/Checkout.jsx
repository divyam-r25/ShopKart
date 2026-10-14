import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { createPaymentOrder, verifyPayment } from "../services/api";

const FIELDS = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
const LABELS = {
  fullName: "Full name",
  phone: "Phone number",
  addressLine1: "Address",
  city: "City",
  state: "State",
  pincode: "Pincode",
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Checkout({ user, setUser }) {
  const { cart, clear } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Client-side validation before hitting the API
  const validate = () => {
    if (FIELDS.some((f) => !form[f].trim())) return "Please complete all shipping fields.";
    if (!/^\d{10}$/.test(form.phone.trim())) return "Phone must contain exactly 10 digits.";
    if (!/^\d{6}$/.test(form.pincode.trim())) return "Pincode must contain exactly 6 digits.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) return setError(validationError);

    setBusy(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay Checkout. Check your internet connection and try again.");
      }

      const { data } = await createPaymentOrder(form);

      const paymentObject = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart Order",
        order_id: data.razorpayOrderId,
        prefill: {
          name: form.fullName,
          contact: form.phone,
        },
        theme: { color: "#153c33" },
        handler: async (response) => {
          // Do NOT trust this callback alone — always verify on the backend
          try {
            const result = await verifyPayment({
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            // Only clear cart and redirect after server confirms payment
            clear();
            navigate(`/orders/${result.data.order._id}`);
          } catch (err) {
            setError(
              err.response?.data?.message ||
                "Payment verification failed. Your cart has been preserved. Please contact support."
            );
            setBusy(false);
          }
        },
      });

      paymentObject.on("payment.failed", (response) => {
        console.error("Razorpay payment failed:", response.error);
        setError(
          "Payment was not completed. Your cart has not been cleared — please try again."
        );
        setBusy(false);
      });

      paymentObject.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to begin payment. Please try again."
      );
      setBusy(false);
    }
  };

  if (!cart.length) {
    return (
      <>
        <Navbar user={user} setUser={setUser} />
        <div className="state">
          <h3>Your cart is empty.</h3>
          <p>Add products to your cart before checking out.</p>
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
      <main className="checkout">
        <h1>Checkout</h1>

        {error && <div className="form-message error">{error}</div>}

        <div className="cart-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2>Shipping details</h2>
            {FIELDS.map((field) => (
              <label key={field}>
                {LABELS[field]}
                <input
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  placeholder={
                    field === "phone"
                      ? "10-digit mobile number"
                      : field === "pincode"
                      ? "6-digit pincode"
                      : ""
                  }
                />
              </label>
            ))}
            <button className="primary-btn" disabled={busy}>
              {busy ? "Preparing secure payment…" : "Pay with Razorpay"}
            </button>
          </form>

          <aside className="summary">
            <h2>Order summary</h2>
            {cart.map((item) => (
              <p key={item.product._id}>
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <b>₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</b>
              </p>
            ))}
            <div className="rule" />
            <p className="summary-total">
              <span>Total</span>
              <b>₹{subtotal.toLocaleString("en-IN")}</b>
            </p>
          </aside>
        </div>
      </main>
    </>
  );
}
