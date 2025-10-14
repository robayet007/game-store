"use client"

import { useState } from "react";
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import "./NavMenu.css";

function NavMenu() {
  const [activeItem, setActiveItem] = useState("home");

  return (
    <div className="navmenu-wrapper">
      <nav className="navmenu-container">
        {/* Animated Border */}
        <div className="animated-border"></div>
        
        {/* Home Link */}
        <Link 
          to="/" 
          className={`navmenu-item ${activeItem === "home" ? "active" : ""}`}
          onClick={() => setActiveItem("home")}
        >
          <div className="navmenu-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="navmenu-text">Home</span>
        </Link>

        {/* Games Link */}
        <Link 
          to="/games" 
          className={`navmenu-item ${activeItem === "games" ? "active" : ""}`}
          onClick={() => setActiveItem("games")}
        >
          <div className="navmenu-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 12h12M12 6v12"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
          <span className="navmenu-text">Games</span>
        </Link>

        {/* Avatar/Profile Link */}
        <Link 
          to="/profile" 
          className={`navmenu-item ${activeItem === "profile" ? "active" : ""}`}
          onClick={() => setActiveItem("profile")}
        >
          <div className="navmenu-icon">
            <User size={24} />
          </div>
          <span className="navmenu-text">Profile</span>
        </Link>
      </nav>
    </div>
  );
}

export default NavMenu;