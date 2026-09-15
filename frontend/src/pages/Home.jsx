import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home({ user, setUser }) {
  const firstName = user?.fullName?.split(" ")[0] || "there";

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <main className="home">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow accent">AUTUMN / WINTER 2026</p>
            <h1>
              Objects for a <i>well-lived</i> life.
            </h1>
            <p>Explore an edit of considered essentials, unexpected finds, and little luxuries.</p>
            <Link className="primary-btn hero-button" to="/products">
              Shop the edit <span>→</span>
            </Link>
          </div>
          <div className="hero-art">
            <div className="sun"></div>
            <div className="arch"></div>
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=85"
              alt="A thoughtfully styled living space"
            />
            <span className="image-note">01 / HOME EDIT</span>
          </div>
        </section>
        <section className="welcome-row">
          <p className="eyebrow">YOUR SHOPKART</p>
          <h2>Welcome back, {firstName}.</h2>
          <p>{user?.email} · {user?.phone}</p>
        </section>
        <section className="values">
          <div>
            <span>01</span>
            <h3>Made to last</h3>
            <p>Pieces selected for life beyond the season.</p>
          </div>
          <div>
            <span>02</span>
            <h3>Thoughtfully sourced</h3>
            <p>Good design, delivered with a lighter footprint.</p>
          </div>
          <div>
            <span>03</span>
            <h3>For every day</h3>
            <p>Useful objects that make the ordinary feel special.</p>
          </div>
        </section>
      </main>
    </>
  );
}
