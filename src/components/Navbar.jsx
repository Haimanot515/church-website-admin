import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTimes, FaBars } from "react-icons/fa";
import { useAdminMenu } from "./AdminMenuContext";
import "./Navbar.css";

// Crown of thorns logo
const ThornCrownLogo = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="30" fill="none" stroke="#fff" strokeWidth="4" />
    {Array.from({ length: 12 }).map((_, i) => {
      const angle = (i * 30 * Math.PI) / 180;
      const x1 = 50 + 30 * Math.cos(angle);
      const y1 = 50 + 30 * Math.sin(angle);
      const x2 = 50 + 42 * Math.cos(angle);
      const y2 = 50 + 42 * Math.sin(angle);

      return (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
        />
      );
    })}
    <line x1="50" y1="30" x2="50" y2="70" stroke="#fff" strokeWidth="4" />
    <line x1="38" y1="42" x2="62" y2="42" stroke="#fff" strokeWidth="4" />
  </svg>
);

const Navbar = ({ loggedIn, isAdmin, setLoggedIn, setIsAdmin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { mobileOpen, setMobileOpen } = useAdminMenu();

  const onAdminRoute = isAdmin && location.pathname.startsWith("/admin");
  const menuIsOpen = onAdminRoute ? mobileOpen : isMenuOpen;

  const closeMenu = () => setIsMenuOpen(false);

  const handleToggle = () => {
    if (onAdminRoute) {
      setMobileOpen((v) => !v);
    } else {
      setIsMenuOpen((v) => !v);
    }
  };

  const logoDestination = loggedIn && isAdmin ? "/admin/dashboard" : "/";

  return (
    <>
      <nav className="navbar">
        <Link to={logoDestination} className="navbar-logo" onClick={closeMenu}>
          <ThornCrownLogo />
        </Link>

        <button
          className="menu-toggle"
          onClick={handleToggle}
          aria-label="Toggle Menu"
        >
          {menuIsOpen ? <FaTimes /> : <FaBars />}
        </button>

        {!onAdminRoute && (
          <div className={`nav-content ${isMenuOpen ? "active" : ""}`}>
            <div className="nav-links-row">
              <div className="nav-links-primary">
                <Link to="/about" onClick={closeMenu}>Help</Link>
                <Link to="/about" onClick={closeMenu}>Policy</Link>

                {loggedIn && isAdmin && (
                  <Link to="/admin/dashboard" onClick={closeMenu}>Admin Dashboard</Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {!onAdminRoute && isMenuOpen && <div className="nav-backdrop" onClick={closeMenu} />}
    </>
  );
};

export default Navbar;