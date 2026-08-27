import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home,
  Users,
  MessageSquare,
  Info,
  LogOut,
  Megaphone,
  Church,
  LayoutDashboard,
  FileText,
  Wrench,
  Image,
  Tags,
  Languages as LanguagesIcon,
  Mail,
  ArrowLeft,
  Target,
  HelpCircle,
  Banknote,
} from "lucide-react";
import API from "../api/api";
import { useAdminMenu } from "./AdminMenuContext";
import "./AdminSidebar.css";

const NAVBAR_HEIGHT = 78; // keep in sync with .navbar's rendered height

const SECTION_DEFS = [
  {
    key: "users",
    icon: Users,
    links: [
      { to: "/admin/users/view", labelKey: "view" },
      { to: "/admin/users/update", labelKey: "update" },
      { to: "/admin/users/delete", labelKey: "delete" },
    ],
  },
  {
    key: "posts",
    icon: FileText,
    links: [
      { to: "/admin/posts/create", labelKey: "create" },
      { to: "/admin/posts/view", labelKey: "view" },
    ],
  },
  {
    key: "categories",
    icon: Tags,
    links: [
      { to: "/admin/categories/create", labelKey: "create" },
      { to: "/admin/categories/view", labelKey: "view" },
    ],
  },
  {
    key: "media",
    icon: Image,
    links: [
      { to: "/admin/media/create", labelKey: "create" },
      { to: "/admin/media/view", labelKey: "view" },
    ],
  },
  {
    key: "homehero",
    icon: Home,
    links: [
      { to: "/admin/hero/create", labelKey: "create" },
      { to: "/admin/hero/view", labelKey: "view" },
    ],
  },
  {
    key: "about",
    icon: Info,
    links: [
      { to: "/admin/about/create", labelKey: "create" },
      { to: "/admin/about/view", labelKey: "view" },
    ],
  },
  {
    key: "missionVision",
    icon: Target,
    links: [
      { to: "/admin/mission-vision/create", labelKey: "create" },
      { to: "/admin/mission-vision/view", labelKey: "view" },
    ],
  },
  {
    key: "services",
    icon: Wrench,
    links: [
      { to: "/admin/services/create", labelKey: "create" },
      { to: "/admin/services/view", labelKey: "view" },
    ],
  },
  {
    key: "churches",
    icon: Church,
    links: [
      { to: "/admin/churches/create", labelKey: "create" },
      { to: "/admin/churches/view", labelKey: "view" },
      { to: "/admin/church-persons/create", labelKey: "personCreate" },
      { to: "/admin/church-persons/view", labelKey: "personView" },
      { to: "/admin/church-persons/reorder", labelKey: "personReorder" },
      { to: "/admin/church-story/create", labelKey: "chapterCreate" },
      { to: "/admin/church-story/view", labelKey: "chapterView" },
    ],
  },
  {
    key: "bankAccounts",
    icon: Banknote,
    links: [
      { to: "/admin/bank-accounts/create", labelKey: "create" },
      { to: "/admin/bank-accounts/view", labelKey: "view" },
    ],
  },
  {
    key: "faq",
    icon: HelpCircle,
    links: [
      { to: "/admin/faq/create", labelKey: "create" },
      { to: "/admin/faq/view", labelKey: "view" },
    ],
  },
  {
    key: "contacts",
    icon: MessageSquare,
    links: [
      { to: "/admin/contacts/view", labelKey: "view" },
      { to: "/admin/contacts/reply", labelKey: "reply" },
      { to: "/admin/contacts/delete", labelKey: "delete" },
    ],
  },
  {
    key: "subscribers",
    icon: Mail,
    links: [
      { to: "/admin/subscribers/create", labelKey: "create" },
      { to: "/admin/subscribers/view", labelKey: "view" },
    ],
  },
  {
    key: "promotions",
    icon: Megaphone,
    links: [
      { to: "/admin/promotions/create", labelKey: "create" },
      { to: "/admin/promotions/view", labelKey: "view" },
    ],
  },
  {
    key: "languages",
    icon: LanguagesIcon,
    links: [
      { to: "/admin/languages/create", labelKey: "create" },
      { to: "/admin/languages/view", labelKey: "view" },
    ],
  },
];

const AdminSidebar = ({ setLoggedIn, setIsAdmin }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { mobileOpen, setMobileOpen } = useAdminMenu();

  // Build the translated sections from the static structure + i18n labels
  const SECTIONS = SECTION_DEFS.map((section) => ({
    key: section.key,
    icon: section.icon,
    label: t(`adminSidebar.sections.${section.key}.label`),
    links: section.links.map((link) => ({
      to: link.to,
      label: t(`adminSidebar.sections.${section.key}.links.${link.labelKey}`),
    })),
  }));

  // "main" = section list (mobile step 1), "sub" = links for chosen section (mobile step 2)
  // Only affects mobile layout — desktop always shows both panels regardless.
  const [mobileView, setMobileView] = useState("main");
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const matchedSection = SECTIONS.find((s) =>
    s.links.some((l) => location?.pathname?.startsWith(l.to))
  )?.key;

  const [activeSection, setActiveSection] = useState(matchedSection ?? SECTIONS[0].key);

  const currentSection = SECTIONS.find((s) => s.key === activeSection) ?? SECTIONS[0];

  // Every time the drawer opens, start back at the main section list.
  useEffect(() => {
    if (mobileOpen) setMobileView("main");
  }, [mobileOpen]);

  const clearSessionAndRedirect = () => {
    sessionStorage.removeItem("token");
    setLoggedIn(false);
    setIsAdmin(false);
    setMobileOpen(false);
    navigate("/");
  };

  // Show the message for a moment before navigating away, so the user
  // actually gets to read it instead of it flashing and vanishing.
  const MESSAGE_DISPLAY_MS = 1500;

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    let message;

    try {
      const token = sessionStorage.getItem("token");

      await API.post(
        "/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message = t("adminSidebar.logoutSuccess", {
        defaultValue: "Logged out successfully.",
      });
    } catch (err) {
      console.log(err);

      if (err.response) {
        // The request reached the server, but it responded with an error
        // (e.g. 400/401/403/500). Show whatever message the server sent.
        message =
          err.response.data?.msg ||
          t("adminSidebar.logoutServerError", {
            defaultValue: "Logout failed. Please try again.",
          });
      } else {
        // No response at all — offline, DNS failure, server unreachable.
        message = t("adminSidebar.logoutOfflineError", {
          defaultValue: "Couldn't reach the server. Check your connection and try again.",
        });
      }
    }

    setLogoutError(message);
    setLoggingOut(false);

    // Whether it succeeded or failed, the user still gets logged out
    // locally and sent to the login page — just after they've had a
    // moment to see why.
    setTimeout(() => {
      clearSessionAndRedirect();
    }, MESSAGE_DISPLAY_MS);
  };

  const goToDashboard = () => {
    setMobileOpen(false);
    navigate("/admin/dashboard");
  };

  const selectSection = (key) => {
    setActiveSection(key);
    setMobileView("sub"); // drill into submenu on mobile
  };

  const onDashboard = location?.pathname === "/admin/dashboard";

  const navbarHeightVar = { "--navbar-h": `${NAVBAR_HEIGHT}px` };

  return (
    <>
      {ReactDOM.createPortal(
        <div
          className={`admin-portal-root${mobileOpen ? " mobile-open" : ""} mobile-view-${mobileView}`}
          style={navbarHeightVar}
        >
          <div className="admin-icon-rail">
            <div className="admin-icon-rail-scroll">
              <div className="admin-badge">A</div>

              <button
                onClick={goToDashboard}
                title={t("adminSidebar.dashboard")}
                className={`admin-icon-btn${onDashboard ? " active" : ""}`}
              >
                <LayoutDashboard size={19} />
                <span>{t("adminSidebar.dashboard")}</span>
              </button>

              <div className="admin-rail-divider" />

              {SECTIONS.map(({ key, label, icon: Icon }) => {
                const isActive = key === activeSection;
                return (
                  <button
                    key={key}
                    onClick={() => selectSection(key)}
                    title={label}
                    className={`admin-icon-btn${isActive ? " active" : ""}`}
                  >
                    <Icon size={19} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title={t("adminSidebar.logout")}
              className="admin-logout-btn"
            >
              <LogOut size={19} />
              <span>{loggingOut ? t("adminSidebar.loggingOut", { defaultValue: "Logging out..." }) : t("adminSidebar.logout")}</span>
            </button>
          </div>

          <div className="admin-label-panel">
            <div className="admin-label-header">
              <button
                className="admin-back-btn"
                onClick={() => setMobileView("main")}
                aria-label={t("adminSidebar.dashboard")}
              >
                <ArrowLeft size={18} />
              </button>
              <span>{currentSection.label}</span>
            </div>

            <nav className="admin-label-nav">
              {currentSection.links.map(({ to, label: linkLabel }) => {
                const active = location?.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`admin-label-link${active ? " active" : ""}`}
                  >
                    {linkLabel}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>,
        document.body
      )}

      <div
        className={`admin-mobile-backdrop${mobileOpen ? " open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {logoutError &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(15, 36, 56, 0.45)",
              zIndex: 9999,
            }}
          >
            <div
              role="alert"
              style={{
                background: "#ffffff",
                borderRadius: "10px",
                padding: "28px 32px",
                maxWidth: "360px",
                width: "90%",
                textAlign: "center",
                boxShadow: "0 20px 40px rgba(15, 36, 56, 0.25)",
                fontSize: "15px",
                color: "#1c3a52",
                lineHeight: 1.5,
              }}
            >
              {logoutError}
            </div>
          </div>,
          document.body
        )}

      <main className="admin-main" style={navbarHeightVar}>
        <Outlet />
      </main>
    </>
  );
};

export default AdminSidebar;