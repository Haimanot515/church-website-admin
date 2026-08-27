import React, { useState, useEffect } from "react";
import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "./components/Navbar";
import { AdminMenuProvider } from "./components/AdminMenuContext";
import useDocumentMeta from "./hooks/useDocumentMeta"; // adjust path if your hook lives elsewhere

/* Pages */
import LandingPage from "./pages/LandingPage";

/* Posts */
import CreatePost from "./pages/posts/CreatePost";
import GetPost from "./pages/posts/GetPost";
import UpdatePost from "./pages/posts/UpdatePost";
import DeletePost from "./pages/posts/DeletePost";

/* Media */
import CreateMedia from "./pages/media/CreateMedia";
import GetMedia from "./pages/media/GetMedia";
import UpdateMedia from "./pages/media/UpdateMedia";
import DeleteMedia from "./pages/media/DeleteMedia";

/* Services */
import CreateService from "./pages/services/CreateService";
import GetService from "./pages/services/GetService";
import UpdateService from "./pages/services/UpdateService";
import DeleteService from "./pages/services/DeleteService";

/* Categories */
import CreateCategory from "./pages/categories/CreateCategory";
import GetCategory from "./pages/categories/GetCategory";
import UpdateCategory from "./pages/categories/UpdateCategory";
import DeleteCategory from "./pages/categories/DeleteCategory";

/* Languages */
import CreateLanguage from "./pages/languages/CreateLanguage";
import GetLanguage from "./pages/languages/GetLanguage";
import UpdateLanguage from "./pages/languages/UpdateLanguage";
import DeleteLanguage from "./pages/languages/DeleteLanguage";

/* Promotions */
import CreatePromotion from "./pages/promotions/CreatePromotion";
import GetPromotion from "./pages/promotions/GetPromotion";
import UpdatePromotion from "./pages/promotions/UpdatePromotion";
import DeletePromotion from "./pages/promotions/DeletePromotion";

/* Subscribers */
import CreateSubscriber from "./pages/subscribers/CreateSubscriber";
import GetSubscribers from "./pages/subscribers/GetSubscribers";

/* Churches */
import CreateChurch from "./pages/churches/CreateChurch";
import GetChurch from "./pages/churches/GetChurch";
import DeleteChurch from "./pages/churches/DeleteChurch";
import ChurchAssignment from "./pages/churches/CreateChurchAssignment";

/* Church Persons */
import CreateChurchPerson from "./pages/churchPersons/CreateChurchPerson";
import GetChurchPerson from "./pages/churchPersons/GetChurchPerson";
import UpdateChurchPerson from "./pages/churchPersons/UpdateChurchPerson";
import DeleteChurchPerson from "./pages/churchPersons/DeleteChurchPerson";
import ReorderChurchPerson from "./pages/churchPersons/ReorderChurchPerson";

/* Church Story */
import CreateChurchStory from "./pages/church-story/CreateChurchStory";
import GetChurchStory from "./pages/church-story/GetChurchStory";
import UpdateChurchStory from "./pages/church-story/UpdateChurchStory";
import DeleteChurchStory from "./pages/church-story/DeleteChurchStory";

/* Bank Accounts */
import CreateBankAccount from "./pages/bankaccount/CreateBankAccount";
import GetBankAccounts from "./pages/bankaccount/GetBankAccounts";

/* About */
import CreateAbout from "./pages/about/CreateAbout";
import GetAbout from "./pages/about/GetAbout";

/* Mission & Vision */
import CreateMissionVision from "./pages/mission-vision/CreateMissionVision";
import GetMissionVision from "./pages/mission-vision/GetMissionVision";

/* FAQ */
import CreateFaq from "./pages/faq/CreateFaq";
import GetFaq from "./pages/faq/GetFaq";

/* ADMIN */
import AdminSidebar from "./components/AdminSidebar";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUser from "./pages/admin/AdminUser";
import AdminProject from "./pages/admin/AdminProject";
import AdminMessages from "./pages/admin/AdminContacts/AdminMessage";
import AdminSkills from "./pages/admin/AdminSkills";
import AdminLanding from "./pages/admin/AdminLanding";

/* Home Hero */
import CreateHomeHero from "./pages/admin/CreateHomeHero";
import GetHomeHero from "./pages/admin/GetHomeHero";

import "./styles.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const { pathname } = useLocation();
  const { i18n } = useTranslation();

  useDocumentMeta(); // updates <html lang>, <title>, and meta tags whenever i18n.language changes

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const adminFlag = payload.isAdmin === true || payload.isAdmin === "true";
        setIsAdmin(adminFlag);
        setLoggedIn(true);
      } catch (err) {
        console.error("Token validation failed", err);
        sessionStorage.removeItem("token");
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
    <AdminMenuProvider>
      {loggedIn && (
        <Navbar
          loggedIn={loggedIn}
          isAdmin={isAdmin}
          setLoggedIn={setLoggedIn}
          setIsAdmin={setIsAdmin}
        />
      )}

      {/*
        key={i18n.language} forces React to unmount/remount the entire
        active route subtree whenever the language changes. Every
        useEffect(() => { fetchX() }, []) inside whatever page is
        currently mounted re-runs as if freshly loaded — no full
        browser reload, no manual [i18n.language] dependency needed
        in every single component.
      */}
      <Routes key={i18n.language}>
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

          {/* Users */}
          <Route path="users/view" element={<AdminUser mode={pathname} />} />
          <Route path="users/update" element={<AdminUser mode={pathname} />} />
          <Route path="users/delete" element={<AdminUser mode={pathname} />} />

          {/* Posts */}
          <Route path="posts/create" element={<CreatePost />} />
          <Route path="posts/view" element={<GetPost />} />
          <Route path="posts/update" element={<GetPost />} />
          <Route path="posts/update/:id" element={<UpdatePost />} />
          <Route path="posts/delete" element={<GetPost />} />
          <Route path="posts/delete/:id" element={<DeletePost />} />

          {/* Media */}
          <Route path="media/create" element={<CreateMedia />} />
          <Route path="media/view" element={<GetMedia />} />
          <Route path="media/update" element={<GetMedia />} />
          <Route path="media/update/:id" element={<UpdateMedia />} />
          <Route path="media/delete" element={<GetMedia />} />
          <Route path="media/delete/:id" element={<DeleteMedia />} />

          {/* Services */}
          <Route path="services/create" element={<CreateService />} />
          <Route path="services/view" element={<GetService />} />
          <Route path="services/update" element={<GetService />} />
          <Route path="services/update/:id" element={<UpdateService />} />
          <Route path="services/delete" element={<GetService />} />
          <Route path="services/delete/:id" element={<DeleteService />} />

          {/* Categories */}
          <Route path="categories/create" element={<CreateCategory />} />
          <Route path="categories/view" element={<GetCategory />} />
          <Route path="categories/update" element={<GetCategory />} />
          <Route path="categories/update/:id" element={<UpdateCategory />} />
          <Route path="categories/delete" element={<GetCategory />} />
          <Route path="categories/delete/:id" element={<DeleteCategory />} />

          {/* Languages */}
          <Route path="languages/create" element={<CreateLanguage />} />
          <Route path="languages/view" element={<GetLanguage />} />
          <Route path="languages/update" element={<GetLanguage />} />
          <Route path="languages/update/:id" element={<UpdateLanguage />} />
          <Route path="languages/delete" element={<GetLanguage />} />
          <Route path="languages/delete/:id" element={<DeleteLanguage />} />

          {/* Promotions */}
          <Route path="promotions/create" element={<CreatePromotion />} />
          <Route path="promotions/view" element={<GetPromotion />} />
          <Route path="promotions/update" element={<GetPromotion />} />
          <Route path="promotions/update/:id" element={<UpdatePromotion />} />
          <Route path="promotions/delete" element={<GetPromotion />} />
          <Route path="promotions/delete/:id" element={<DeletePromotion />} />

          {/* Subscribers */}
          <Route path="subscribers/create" element={<CreateSubscriber />} />
          <Route path="subscribers/view" element={<GetSubscribers />} />

          {/* Churches */}
          <Route path="churches/create" element={<CreateChurch />} />
          <Route path="churches/view" element={<GetChurch />} />
          <Route path="churches/update" element={<GetChurch />} />
          <Route path="churches/delete" element={<GetChurch />} />
          <Route path="churches/delete/:id" element={<DeleteChurch />} />
          <Route path="churches/assign" element={<ChurchAssignment />} />

          {/* Church Persons */}
          <Route path="church-persons/create" element={<CreateChurchPerson />} />
          <Route path="church-persons/view" element={<GetChurchPerson />} />
          <Route path="church-persons/update" element={<GetChurchPerson />} />
          <Route path="church-persons/update/:id" element={<UpdateChurchPerson />} />
          <Route path="church-persons/delete" element={<GetChurchPerson />} />
          <Route path="church-persons/delete/:id" element={<DeleteChurchPerson />} />
          <Route path="church-persons/reorder" element={<ReorderChurchPerson />} />
          {/* NOTE: "reorder" is in the sidebar but isn't a CRUD action —
              no ReorderChurchPerson component exists yet, so it's left
              unwired for now. */}

          {/* Church Story */}
          <Route path="church-story/create" element={<CreateChurchStory />} />
          <Route path="church-story/view" element={<GetChurchStory />} />
          <Route path="church-story/update" element={<GetChurchStory />} />
          <Route path="church-story/update/:id" element={<UpdateChurchStory />} />
          <Route path="church-story/delete" element={<GetChurchStory />} />
          <Route path="church-story/delete/:id" element={<DeleteChurchStory />} />

          {/* Bank Accounts */}
          <Route path="bank-accounts/create" element={<CreateBankAccount />} />
          <Route path="bank-accounts/view" element={<GetBankAccounts />} />
          <Route path="bank-accounts/update" element={<GetBankAccounts />} />
          <Route path="bank-accounts/delete" element={<GetBankAccounts />} />

          {/* Projects (admin) */}
          <Route path="projects/create" element={<AdminProject mode={pathname} />} />
          <Route path="projects/view" element={<AdminProject mode={pathname} />} />
          <Route path="projects/update" element={<AdminProject mode={pathname} />} />
          <Route path="projects/delete" element={<AdminProject mode={pathname} />} />

          {/* Skills (admin) */}
          <Route path="skills/create" element={<AdminSkills mode={pathname} />} />
          <Route path="skills/view" element={<AdminSkills mode={pathname} />} />
          <Route path="skills/update" element={<AdminSkills mode={pathname} />} />
          <Route path="skills/delete" element={<AdminSkills mode={pathname} />} />

          {/* Contacts */}
          <Route path="contacts/view" element={<AdminMessages />} />
          <Route path="contacts/reply" element={<AdminMessages />} />
          <Route path="contacts/delete" element={<AdminMessages />} />

          {/* About */}
          <Route path="about/create" element={<CreateAbout />} />
          <Route path="about/view" element={<GetAbout />} />

          {/* Mission & Vision */}
          <Route path="mission-vision/create" element={<CreateMissionVision />} />
          <Route path="mission-vision/view" element={<GetMissionVision />} />

          {/* FAQ */}
          <Route path="faq/create" element={<CreateFaq />} />
          <Route path="faq/view" element={<GetFaq />} />

          {/* Home Hero */}
          <Route path="hero/create" element={<CreateHomeHero />} />
          <Route path="hero/view" element={<GetHomeHero />} />
        </Route>

        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
    </AdminMenuProvider>
  );
}

export default App;