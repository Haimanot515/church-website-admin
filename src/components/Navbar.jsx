import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaTimes, FaBars, FaGlobe } from "react-icons/fa";
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

const LANGUAGES = [
  { code: "am", label: "አማርኛ" },
  { code: "it", label: "Italiano" },
  { code: "en", label: "English" },
];

const LanguageDropdown = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const current =
    LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selectLanguage = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="lang-dropdown" ref={wrapRef}>
      <button
        type="button"
        className="lang-dropdown-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <FaGlobe style={{ marginRight: 6 }} />
        {current.label}
      </button>

      {open && (
        <ul className="lang-dropdown-menu" role="listbox">
          {LANGUAGES.map((lng) => (
            <li key={lng.code}>
              <button
                type="button"
                role="option"
                aria-selected={lng.code === current.code}
                className={`lang-dropdown-item${lng.code === current.code ? " active" : ""}`}
                onClick={() => selectLanguage(lng.code)}
              >
                {lng.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Navbar = ({ loggedIn, isAdmin, setLoggedIn, setIsAdmin }) => {
  const { t } = useTranslation();
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

        <div className="navbar-right">
          <LanguageDropdown />

          <button
            className="menu-toggle"
            onClick={handleToggle}
            aria-label={t("navbar.toggleMenuAriaLabel")}
          >
            {menuIsOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {!onAdminRoute && (
          <div className={`nav-content ${isMenuOpen ? "active" : ""}`}>
            <div className="nav-links-row">
              <div className="nav-links-primary">
                <Link to="/about" onClick={closeMenu}>{t("navbar.help")}</Link>
                <Link to="/about" onClick={closeMenu}>{t("navbar.policy")}</Link>

                {loggedIn && isAdmin && (
                  <Link to="/admin/dashboard" onClick={closeMenu}>{t("navbar.adminDashboard")}</Link>
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