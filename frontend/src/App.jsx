// App.jsx - Fixed version
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
import { isAdminUser } from "./utils_temp/admin";
import GameDetailsUser from "./components/GameShop/GameDetailsUser";

// ✅ Loading Component - UPDATED
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="loading-content">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  </div>
);

// ✅ Main App Content Component
function AppContent() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/profile/dashboard";
  const isAdminDashboard = location.pathname === "/admin/dashboard";
  const isCheckoutPage = location.pathname.startsWith("/checkout");
  const isAuthPage = location.pathname === "/profile/login" || 
                    location.pathname === "/profile/register" || 
                    location.pathname === "/forgot-password";
  const isGameDetails = location.pathname.startsWith("/game/");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Auth State Changed - User:', user?.email);
      console.log('📍 Current Path:', location.pathname);
      setUser(user);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [location.pathname]);

  // ✅ যদি auth check না হয়ে থাকে, loading show করবে
  if (!authChecked) {
    return <LoadingSpinner />;
  }

  return (
    <div className="app">
      {!isAuthPage && !isAdminDashboard && <Navbar user={user} />}
      {!isCheckoutPage && !isDashboard && !isAuthPage && !isAdminDashboard && !isGameDetails && <Carousel />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<GameShop />} />
        <Route path="/game/:id" element={<GameDetailsUser />} />
        
        {/* Auth Routes */}
        <Route path="/profile/login" element={
          !user ? <Login /> : <Navigate to="/" replace />
        } />
        
        <Route path="/profile/register" element={
          !user ? <Register /> : <Navigate to="/" replace />
        } />

        <Route path="/forgot-password" element={
          !user ? <ForgotPassword /> : <Navigate to="/" replace />
        } />

        {/* Protected Routes */}
        <Route path="/checkout/:id" element={
          user ? <Checkout user={user} /> : <Navigate to="/profile/login" replace />
        } />
        
        <Route path="/profile/dashboard" element={
          user ? <Dashboard /> : <Navigate to="/profile/login" replace />
        } />

        <Route path="/dashboard" element={
          user ? <Navigate to="/profile/dashboard" replace /> : <Navigate to="/profile/login" replace />
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard/*" element={
          user && isAdminUser(user) ? <AdminDashboard /> : <Navigate to="/" replace />
        } />

        {/* ✅ Catch all route - 404 handling */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <NavMenu user={user}/>
      {!isAuthPage && !isDashboard && !isAdminDashboard && !isGameDetails && <Footer />}
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