import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavMenu.css";
import ProfileIcon from "./ProfileIcon";

function NavMenu() {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("home");

  // Route change detect করে active item auto update করবে
  useEffect(() => {
    if (location.pathname === "/") {
      setActiveItem("home");
    } else if (location.pathname === "/games") {
      setActiveItem("games");
    } else if (location.pathname.includes("/dashboard")) {
      setActiveItem("profile");
    } else {
      setActiveItem(""); // অন্য কোনো route হলে active remove হবে
    }
  }, [location.pathname]);

  return (
    <div className="navmenu-wrapper">
      <nav className="navmenu-container">
        {/* Animated Border */}
        <div className="animated-border"></div>

        {/* Home Link */}
        <Link
          to="/"
          className={`navmenu-item ${activeItem === "home" ? "active" : ""}`}
        >
          <div className="navmenu-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="navmenu-text">Home</span>
        </Link>

        {/* Games Link */}
        <Link
          to="/games"
          className={`navmenu-item ${activeItem === "games" ? "active" : ""}`}
        >
          <div className="navmenu-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 12h12M12 6v12" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <span className="navmenu-text">Games</span>
        </Link>

        {/* Profile Icon */}
        <ProfileIcon />
      </nav>
    </div>
  );
}

export default NavMenu;