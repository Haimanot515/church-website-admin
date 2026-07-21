import React from "react";
import { Link } from "react-router-dom";
import { 
  FaGithub, FaLinkedin, FaEnvelope, FaTwitter, FaTelegram, 
  FaStackOverflow, FaArrowUp, FaYoutube, 
  FaMedium, FaWhatsapp, FaInstagram, FaFacebook 
} from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footerWrapper">
      {/* 1. Back to Top Bar */}
      <div onClick={scrollToTop} className="backToTop footer-back-to-top">
        <FaArrowUp style={{ marginRight: "10px", fontSize: "10px" }} /> 
        <span style={{ letterSpacing: "4px" }}>BACK TO TOP</span>
      </div>

      {/* 2. Main Content Area */}
      <div className="mainFooter">
        <div className="gridContainer">
          
          {/* Brand/Bio Section */}
          <div className="brandColumn">
            <div className="logoArea">
              <span className="logoText">Haimanot <span className="blueAccent">Beka</span></span>
            </div>
            <p className="brandDesc">
              Software Engineering Student at Addis Ababa University (AAiT). 
              Crafting high-performance digital ecosystems with the MERN stack 
              and a commitment to technical excellence.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="column">
            <div className="columnTitle">Navigation</div>
            <ul className="listStyle">
              <li><Link to="/" className="linkStyle footer-link">Home</Link></li>
              <li><Link to="/about" className="linkStyle footer-link">About Me</Link></li>
              <li><Link to="/projects" className="linkStyle footer-link">Projects</Link></li>
              <li><Link to="/skill" className="linkStyle footer-link">Skills</Link></li>
              <li><Link to="/contact" className="linkStyle footer-link">Contact</Link></li>
            </ul>
          </div>

          {/* Tech Presence */}
          <div className="column">
            <div className="columnTitle">Tech Profile</div>
            <ul className="listStyle">
              <li>
                <a href="https://github.com/Haimanot515" target="_blank" rel="noreferrer" className="socialLinkItem footer-link">
                  <FaGithub className="iconBase" style={{ color: "#171515" }} /> GitHub
                </a>
              </li>
              <li>
                <a href="https://stackoverflow.com" target="_blank" rel="noreferrer" className="socialLinkItem footer-link">
                  <FaStackOverflow className="iconBase" style={{ color: "#f48024" }} /> Stack Overflow
                </a>
              </li>
              <li>
                <a href="https://medium.com" target="_blank" rel="noreferrer" className="socialLinkItem footer-link">
                  <FaMedium className="iconBase" style={{ color: "#0f172a" }} /> Tech Articles
                </a>
              </li>
              <li className="socialGroupRow">
                <a href="https://wa.me/haimanotbeka" target="_blank" rel="noreferrer" className="rowIcon"><FaWhatsapp /></a>
                <a href="https://t.me/haimasearchjobplanstart" target="_blank" rel="noreferrer" className="rowIcon"><FaTelegram /></a>
                <a href="https://facebook.com/haimanotbeka" target="_blank" rel="noreferrer" className="rowIcon"><FaFacebook /></a>
              </li>
            </ul>
          </div>

          {/* Social Network */}
          <div className="column">
            <div className="columnTitle">Social Connect</div>
            <ul className="listStyle">
              <li>
                <a href="https://linkedin.com/in/haimanotbeka" target="_blank" rel="noreferrer" className="socialLinkItem footer-link">
                  <FaLinkedin className="iconBase" style={{ color: "#0077b5" }} /> LinkedIn
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="socialLinkItem footer-link">
                  <FaTwitter className="iconBase" style={{ color: "#1DA1F2" }} /> Twitter / X
                </a>
              </li>
              <li>
                <a href="https://instagram.com/haimanotbeka" target="_blank" rel="noreferrer" className="socialLinkItem footer-link">
                  <FaInstagram className="iconBase" style={{ color: "#E4405F" }} /> Instagram
                </a>
              </li>
              <li>
                <a href="https://youtube.com/@haimanotbeka" target="_blank" rel="noreferrer" className="socialLinkItem footer-link">
                  <FaYoutube className="iconBase" style={{ color: "#FF0000" }} /> YouTube
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* 3. Bottom Legal Bar */}
      <div className="bottomBar">
        <div className="bottomContainer">
          <div className="copyText">
            © {currentYear} Haimanot Beka Mekonnen. Built with Precision in Addis Ababa.
          </div>
          <div className="socialIconsRow">
            <a href="https://github.com/Haimanot515" target="_blank" rel="noreferrer" className="bottomIcon"><FaGithub /></a>
            <a href="https://linkedin.com/in/haimanotbeka" target="_blank" rel="noreferrer" className="bottomIcon"><FaLinkedin /></a>
            <a href="mailto:haimanotbeka@gmail.com" className="bottomIcon"><FaEnvelope /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
