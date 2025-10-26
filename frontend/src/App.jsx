// App.jsx - GameDetails route গুলো সরিয়ে দিন
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import Carousel from "./components/Carousel/Carousel";
import Home from "./pages/Home/Home";
import NavMenu from "./components/NavMenu/NavMenu";
import Footer from "./components/Footer/Footer";
import GameShop from "./components/GameShop/GameShop";
import Checkout from "./components/Checkout/Checkout";
import Register from "./Auth/Register";
import Login from "./Auth/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import ForgotPassword from "./Auth/ForgotPassword";
import AdminDashboard from "./components/Admin/AdminDashboard";
import { isAdminUser } from "./Utils/Admin"; // ✅ CORRECTED IMPORT
import GameDetailsUser from "./components/GameShop/GameDetailsUser";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return user ? children : <Navigate to="/profile/login" />;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return !user ? children : <Navigate to="/" />;
};

// ✅ Admin Route Component
const AdminRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const isAdmin = user && isAdminUser(user);
  return isAdmin ? children : <Navigate to="/" />;
};

function AppContent() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  
  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/profile/dashboard";
  const isAdminDashboard = location.pathname === "/admin/dashboard";
  const isCheckoutPage = location.pathname.startsWith("/checkout");
  const isAuthPage = location.pathname === "/profile/login" || 
                    location.pathname === "/profile/register" || 
                    location.pathname === "/forgot-password";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Auth State Changed - User:', user?.email);
      console.log('📍 Current Path:', location.pathname);
      setUser(user);
    });

    return () => unsubscribe();
  }, [location.pathname]);

  return (
    <div className="app">
      {!isAuthPage && !isAdminDashboard && <Navbar user={user} />}
      {!isCheckoutPage && !isDashboard && !isAuthPage && !isAdminDashboard && <Carousel />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<GameShop />} />
        {/* GameDetailsUser route */}
        <Route path="/game/:id" element={<GameDetailsUser />} />
        
        {/* ✅ Checkout Routes */}
        <Route path="/checkout/:id" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        
        <Route path="/profile/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* ✅ Admin Routes */}
        <Route path="/admin/dashboard/*" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        
        {/* Auth Routes */}
        <Route path="/profile/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/profile/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      <NavMenu user={user}/>
      {!isAuthPage && !isDashboard && !isAdminDashboard && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;