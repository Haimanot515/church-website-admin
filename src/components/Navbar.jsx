import React, { useState, useEffect } from "react";
import Login from "../pages/Login";
import AdminLogin from "../pages/LandingPage"; // <-- import the admin login page/component
import Form from "../pages/Registration/Form";
import Verify from "../pages/Registration/Verify"; 
import { Link, useNavigate } from "react-router-dom";
import { FaTimes, FaBars } from "react-icons/fa";
import "./Navbar.css"; 

const Navbar = ({ loggedIn, isAdmin, setLoggedIn, setIsAdmin }) => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false); // <-- new
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (loggedIn) {
      closeModals();
    }
  }, [loggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setIsAdmin(false);
    closeModals();
    setIsMenuOpen(false);
    navigate("/"); 
  };

  const handleNavClick = (e) => {
    if (!loggedIn) {
      e.preventDefault(); 
      e.stopPropagation(); 
      openLogin();
    }
    setIsMenuOpen(false);
  };

  // Separate handler just for the Admin link
  const handleAdminClick = (e) => {
    if (!loggedIn || !(isAdmin === true || isAdmin === "true")) {
      e.preventDefault();
      e.stopPropagation();
      openAdminLogin();
    }
    setIsMenuOpen(false);
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowVerify(false);
    setShowAdminLogin(false); // <-- reset too
  };

  const openRegister = () => { closeModals(); setShowRegister(true); };
  const openLogin = () => { closeModals(); setShowLogin(true); };
  const openVerify = () => { closeModals(); setShowVerify(true); };
  const openAdminLogin = () => { closeModals(); setShowAdminLogin(true); }; // <-- new

  return (
    <>
      <nav className="navbar">
        {/* Hamburger for Mobile */}
        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`nav-content ${isMenuOpen ? "active" : ""}`}>
          <Link to="/home" onClick={handleNavClick}>Home</Link>
          <Link to="/projects" onClick={handleNavClick}>Projects</Link>
          <Link to="/skill" onClick={handleNavClick}>Skills</Link>
          <Link to="/contact" onClick={handleNavClick}>Contact</Link>
          <Link to="/about" onClick={handleNavClick}>About</Link>
          <Link to="/testimonials" onClick={handleNavClick}>Testimony</Link>

          {loggedIn ? (
            <>
              {(isAdmin === true || isAdmin === "true") && (
                <Link to="/admin/users/view" onClick={() => setIsMenuOpen(false)}>Admin</Link>
              )}
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              {/* Admin link now always visible, but gated by handleAdminClick */}
              <Link to="/admin/users/view" onClick={handleAdminClick}>Admin</Link>
              <button onClick={openLogin}>Login</button>
              <button onClick={openRegister}>Register</button>
            </>
          )}
        </div>
      </nav>

      {/* MODALS */}
      {(showLogin || showRegister || showVerify || showAdminLogin) && (
        <div className="overlay" onClick={closeModals}>
          <div className="auth-card" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModals} className="close-btn-style">
              <FaTimes />
            </button>
            {showLogin && <Login setLoggedIn={setLoggedIn} setIsAdmin={setIsAdmin} closeModal={closeModals} switchToRegister={openRegister} />}
            {showRegister && <Form closeModal={closeModals} switchToLogin={openLogin} switchToVerify={openVerify} />}
            {showVerify && <Verify setLoggedIn={setLoggedIn} setIsAdmin={setIsAdmin} closeModal={closeModals} />}
            {showAdminLogin && <AdminLogin setLoggedIn={setLoggedIn} setIsAdmin={setIsAdmin} closeModal={closeModals} />}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;