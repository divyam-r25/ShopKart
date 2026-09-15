import { Navigate } from "react-router-dom";
export default function ProtectedRoute({ user, loading, children }) { if (loading) return <div className="page-loader">Loading your ShopKart…</div>; return user ? children : <Navigate to="/login" replace />; }
