import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname === "/profile"
  const isCheckoutPage = location.pathname === "/checkout";
  const isAuthPage = location.pathname === "/profile/login" || location.pathname === "/profile/register";

  return (
    <div className="app">
      {!isAuthPage && <Navbar/>}
      {!isCheckoutPage && !isDashboard && !isAuthPage && <Carousel />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<GameShop />} />
        <Route path="/checkout" element={<Checkout/>} />
        <Route path="/profile/login" element={<Login/>} />
        <Route path="/profile/register" element={<Register/>} />
      </Routes>
      {!isAuthPage && <NavMenu/>}
      {!isAuthPage && !isDashboard && <Footer/>}
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
