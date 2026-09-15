import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMe } from "./services/api";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const protect = (page) => (
    <ProtectedRoute user={user} loading={loading}>
      {page}
    </ProtectedRoute>
  );

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/home" replace /> : <Auth mode="login" setUser={setUser} />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/home" replace /> : <Auth mode="register" setUser={setUser} />}
      />
      <Route path="/home" element={protect(<Home user={user} setUser={setUser} />)} />
      <Route path="/products" element={protect(<Products user={user} setUser={setUser} />)} />
      <Route path="/products/:id" element={protect(<ProductDetails user={user} setUser={setUser} />)} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
