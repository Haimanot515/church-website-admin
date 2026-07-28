import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
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
  Menu,
  X,
} from "lucide-react";
import "./AdminSidebar.css";

const NAVBAR_HEIGHT = 78; // keep in sync with .navbar's rendered height

const SECTIONS = [
  {
    key: "homehero",
    label: "Home Hero",
    icon: Home,
    links: [
      { to: "/admin/hero/create", label: "Create Home Hero" },
      { to: "/admin/hero/view", label: "View Home Hero" },
    ],
  },
  {
    key: "users",
    label: "Users",
    icon: Users,
    links: [
      { to: "/admin/users/view", label: "View Users" },
      { to: "/admin/users/update", label: "Update Users" },
      { to: "/admin/users/delete", label: "Delete Users" },
    ],
  },
  {
    key: "posts",
    label: "Posts",
    icon: FileText,
    links: [
      { to: "/admin/posts/create", label: "Create Post" },
      { to: "/admin/posts/view", label: "View Posts" },
    ],
  },
  {
    key: "services",
    label: "Services",
    icon: Wrench,
    links: [
      { to: "/admin/services/create", label: "Create Service" },
      { to: "/admin/services/view", label: "View Services" },
    ],
  },
  {
    key: "media",
    label: "Media",
    icon: Image,
    links: [
      { to: "/admin/media/create", label: "Create Media" },
      { to: "/admin/media/view", label: "View Media" },
    ],
  },
  {
    key: "categories",
    label: "Categories",
    icon: Tags,
    links: [
      { to: "/admin/categories/create", label: "Create Category" },
      { to: "/admin/categories/view", label: "View Categories" },
    ],
  },
  {
    key: "languages",
    label: "Languages",
    icon: LanguagesIcon,
    links: [
      { to: "/admin/languages/create", label: "Create Language" },
      { to: "/admin/languages/view", label: "View Languages" },
    ],
  },
  {
    key: "churches",
    label: "Churches",
    icon: Church,
    links: [
      { to: "/admin/churches/create", label: "Create Church" },
      { to: "/admin/churches/view", label: "View Churches" },
      { to: "/admin/churches/update", label: "Update Churches" },
      { to: "/admin/churches/delete", label: "Delete Churches" },
      { to: "/admin/churches/assign", label: "Assign Church" },
      { to: "/admin/church-persons/create", label: "Create Person" },
      { to: "/admin/church-persons/view", label: "View Persons" },
      { to: "/admin/church-persons/update", label: "Update Persons" },
      { to: "/admin/church-persons/reorder", label: "Reorder Persons" },
      { to: "/admin/church-persons/delete", label: "Delete Persons" },
      { to: "/admin/church-story/create", label: "Create Chapter" },
      { to: "/admin/church-story/view", label: "View Chapters" },
      { to: "/admin/church-story/update", label: "Update Chapters" },
      { to: "/admin/church-story/delete", label: "Delete Chapters" },
    ],
  },
  {
    key: "contacts",
    label: "Contacts",
    icon: MessageSquare,
    links: [
      { to: "/admin/contacts/view", label: "View Messages" },
      { to: "/admin/contacts/reply", label: "Reply Messages" },
      { to: "/admin/contacts/delete", label: "Delete Messages" },
    ],
  },
  {
    key: "promotions",
    label: "Promotions",
    icon: Megaphone,
    links: [
      { to: "/admin/promotions/create", label: "Create Promotion" },
      { to: "/admin/promotions/view", label: "View Promotions" },
    ],
  },
  {
    key: "subscribers",
    label: "Subscribers",
    icon: Mail,
    links: [
      { to: "/admin/subscribers/create", label: "Add Subscriber" },
      { to: "/admin/subscribers/view", label: "View Subscribers" },
    ],
  },
  {
    key: "about",
    label: "About",
    icon: Info,
    links: [
      { to: "/admin/about/create", label: "Create About" },
      { to: "/admin/about/view", label: "View About" },
    ],
  },
];

const AdminSidebar = ({ setLoggedIn, setIsAdmin }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const matchedSection = SECTIONS.find((s) =>
    s.links.some((l) => location?.pathname?.startsWith(l.to))
  )?.key;

  const [activeSection, setActiveSection] = useState(matchedSection ?? SECTIONS[0].key);

  const currentSection = SECTIONS.find((s) => s.key === activeSection) ?? SECTIONS[0];

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setIsAdmin(false);
    setMobileOpen(false);
    navigate("/");
  };

  const goToDashboard = () => {
    setMobileOpen(false);
    navigate("/admin/dashboard");
  };

  const onDashboard = location?.pathname === "/admin/dashboard";

  const navbarHeightVar = { "--navbar-h": `${NAVBAR_HEIGHT}px` };

  return (
    <>
      {ReactDOM.createPortal(
        <div
          className={`admin-portal-root${mobileOpen ? " mobile-open" : ""}`}
          style={navbarHeightVar}
        >
          <div className="admin-icon-rail">
            <div className="admin-icon-rail-scroll">
              <div className="admin-badge">A</div>

              <button
                onClick={goToDashboard}
                title="Dashboard"
                className={`admin-icon-btn${onDashboard ? " active" : ""}`}
              >
                <LayoutDashboard size={19} />
                <span>Dashboard</span>
              </button>

              <div className="admin-rail-divider" />

              {SECTIONS.map(({ key, label, icon: Icon }) => {
                const isActive = key === activeSection;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    title={label}
                    className={`admin-icon-btn${isActive ? " active" : ""}`}
                  >
                    <Icon size={19} />
                    <span>{label.length > 8 ? label.split(" ")[0] : label}</span>
                  </button>
                );
              })}
            </div>

            <button onClick={handleLogout} title="Logout" className="admin-logout-btn">
              <LogOut size={19} />
              <span>Logout</span>
            </button>
          </div>

          <div className="admin-label-panel">
            <div className="admin-label-header">
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

            <div className="admin-label-footer">
              <button onClick={handleLogout} className="admin-label-logout">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <button
        className="admin-mobile-toggle"
        style={navbarHeightVar}
        onClick={() => setMobileOpen((v) => !v)}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div
        className={`admin-mobile-backdrop${mobileOpen ? " open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      <main className="admin-main" style={navbarHeightVar}>
        <Outlet />
      </main>
    </>
  );
};

export default AdminSidebar;