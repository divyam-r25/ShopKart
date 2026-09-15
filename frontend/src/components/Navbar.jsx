import { Link, NavLink, useNavigate } from "react-router-dom";
import { logoutCustomer } from "../services/api";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const logout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      console.error(err);
    } finally {
      if (setUser) setUser(null);
      navigate("/login");
    }
  };

  return (
    <header className="navbar">
      <Link className="brand" to="/home">
        <span className="brand-mark">S</span>
        <span>shopkart</span>
      </Link>
      <nav>
        <NavLink to="/home">Home</NavLink>
        <NavLink to="/products">Shop</NavLink>
      </nav>
      <div className="nav-actions">
        <span className="user-greeting">
          Hi, {user?.fullName?.split(" ")[0] || "there"}
        </span>
        <button className="logout" onClick={logout}>
          Log out <span>↗</span>
        </button>
      </div>
    </header>
  );
}
