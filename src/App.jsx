import React, { useState, useEffect } from "react";
import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CreatePost from "./pages/posts/CreatePost";
import CreateMedia from "./pages/media/CreateMedia";
import CreateService from "./pages/services/CreateService";
import CreateCategory from "./pages/categories/CreateCategory";
import CreateLanguage from "./pages/languages/CreateLanguage";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Skill from "./pages/Skill";
import Testimonials from "./pages/Testimonials";
import LandingPage from "./pages/LandingPage";
import CV from "./pages/Cv";

/* ADMIN */
import AdminSidebar from "./components/AdminSidebar";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUser from "./pages/admin/AdminUser";
import AdminProject from "./pages/admin/AdminProject";
import AdminMessages from "./pages/admin/AdminContacts/AdminMessage";
import AdminAbout from "./pages/admin/AdminAbout";
import AdminSkills from "./pages/admin/AdminSkills";
import AdminLanding from "./pages/admin/AdminLanding";
import AdminHomeHero from "./pages/admin/AdminHomeHero";

import "./styles.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const { pathname } = useLocation();
  const hideFooter = pathname.startsWith("/admin");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const adminFlag = payload.isAdmin === true || payload.isAdmin === "true";
        setIsAdmin(adminFlag);
        setLoggedIn(true);
      } catch (err) {
        console.error("Token validation failed", err);
        localStorage.removeItem("token");
        setIsAdmin(false);
        setLoggedIn(false);
      }
    } else {
      setIsAdmin(false);
      setLoggedIn(false);
    }
  }, []);

  if (loggedIn === null) return null;

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            loggedIn ? (
              isAdmin ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/home" replace />
              )
            ) : (
              <LandingPage
                loggedIn={loggedIn}
                isAdmin={isAdmin}
                setLoggedIn={setLoggedIn}
                setIsAdmin={setIsAdmin}
              />
            )
          }
        />

        <Route path="/home" element={loggedIn ? <Home /> : <Navigate to="/" />} />
        <Route path="/about" element={loggedIn ? <About /> : <Navigate to="/" />} />
        <Route path="/projects" element={loggedIn ? <Projects /> : <Navigate to="/" />} />
        <Route path="/contact" element={loggedIn ? <Contact /> : <Navigate to="/" />} />
        <Route path="/skill" element={loggedIn ? <Skill /> : <Navigate to="/" />} />
        <Route path="/testimonials" element={loggedIn ? <Testimonials /> : <Navigate to="/" />} />
        <Route path="/cv" element={loggedIn ? <CV /> : <Navigate to="/" />} />

        {/* --- ADMIN PANEL ROUTES --- */}
        <Route
          path="/admin"
          element={
            loggedIn && isAdmin ? (
              <AdminSidebar setLoggedIn={setLoggedIn} setIsAdmin={setIsAdmin} />
            ) : (
              <Navigate to="/" />
            )
          }
        >
          {/* Fallback only — for anyone landing on bare /admin directly */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* Landing Management */}
          <Route path="landing/manage" element={<AdminLanding />} />

          <Route path="users/view" element={<AdminUser mode={pathname} />} />
          <Route path="users/delete" element={<AdminUser mode={pathname} />} />
          <Route path="users/update" element={<AdminUser mode={pathname} />} />

          <Route path="posts/create" element={<CreatePost />} />
          <Route path="media/create" element={<CreateMedia />} />
          <Route path="services/create" element={<CreateService />} />
          <Route path="categories/create" element={<CreateCategory />} />
          <Route path="languages/create" element={<CreateLanguage />} />

          <Route path="projects/create" element={<AdminProject mode={pathname} />} />
          <Route path="projects/view" element={<AdminProject mode={pathname} />} />
          <Route path="projects/update" element={<AdminProject mode={pathname} />} />
          <Route path="projects/delete" element={<AdminProject mode={pathname} />} />

          <Route path="skills/create" element={<AdminSkills mode={pathname} />} />
          <Route path="skills/view" element={<AdminSkills mode={pathname} />} />

          <Route path="contacts/view" element={<AdminMessages />} />
          <Route path="about/create" element={<AdminAbout />} />

          <Route path="hero/create" element={<AdminHomeHero />} />
          <Route path="hero/update" element={<AdminHomeHero />} />
        </Route>

        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>

      {!hideFooter && <Footer />}
    </>
  );
}

export default App;
