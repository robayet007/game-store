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

function AppContent() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  
  const isDashboard = location.pathname === "/dashboard";
  const isCheckoutPage = location.pathname === "/checkout";
  const isAuthPage = location.pathname === "/profile/login" || location.pathname === "/profile/register";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="app">
      {!isAuthPage && <Navbar user={user} />}
      {!isCheckoutPage && !isDashboard && !isAuthPage && <Carousel />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<GameShop />} />
        
        {/* Protected Routes */}
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route path="/profile/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Auth Routes - Only accessible when not logged in */}
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

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {/* {!isAuthPage && <NavMenu user={user} />} */}
      <NavMenu user={user}/>
      {!isAuthPage && !isDashboard && <Footer />}
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