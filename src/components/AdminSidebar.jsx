import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutTemplate,
  Home,
  Users,
  FolderKanban,
  MessageSquare,
  Sparkles,
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
} from "lucide-react";

const SECTIONS = [
  {
    key: "landing",
    label: "Landing",
    icon: LayoutTemplate,
    links: [{ to: "/admin/landing/manage", label: "Manage Landing" }],
  },
  {
    key: "homehero",
    label: "Home Hero",
    icon: Home,
    links: [
      { to: "/admin/hero/create", label: "Create Home Hero" },
      { to: "/admin/hero/view", label: "View Home Hero" },
      { to: "/admin/hero/update", label: "Update Home Hero" },
      { to: "/admin/hero/delete", label: "Delete Home Hero" },
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
    key: "projects",
    label: "Projects",
    icon: FolderKanban,
    links: [
      { to: "/admin/projects/create", label: "Create Project" },
      { to: "/admin/projects/view", label: "View Projects" },
      { to: "/admin/projects/update", label: "Update Projects" },
      { to: "/admin/projects/delete", label: "Delete Projects" },
    ],
  },
  {
    key: "posts",
    label: "Posts",
    icon: FileText,
    links: [
      { to: "/admin/posts/create", label: "Create Post" },
      { to: "/admin/posts/view", label: "View Posts" },
      { to: "/admin/posts/update", label: "Update Posts" },
      { to: "/admin/posts/delete", label: "Delete Posts" },
    ],
  },
  {
    key: "services",
    label: "Services",
    icon: Wrench,
    links: [
      { to: "/admin/services/create", label: "Create Service" },
      { to: "/admin/services/view", label: "View Services" },
      { to: "/admin/services/update", label: "Update Services" },
      { to: "/admin/services/delete", label: "Delete Services" },
    ],
  },
  {
    key: "media",
    label: "Media",
    icon: Image,
    links: [
      { to: "/admin/media/create", label: "Create Media" },
      { to: "/admin/media/view", label: "View Media" },
      { to: "/admin/media/update", label: "Update Media" },
      { to: "/admin/media/delete", label: "Delete Media" },
    ],
  },
  {
    key: "categories",
    label: "Categories",
    icon: Tags,
    links: [
      { to: "/admin/categories/create", label: "Create Category" },
      { to: "/admin/categories/view", label: "View Categories" },
      { to: "/admin/categories/update", label: "Update Categories" },
      { to: "/admin/categories/delete", label: "Delete Categories" },
    ],
  },
  {
    key: "languages",
    label: "Languages",
    icon: LanguagesIcon,
    links: [
      { to: "/admin/languages/create", label: "Create Language" },
      { to: "/admin/languages/view", label: "View Languages" },
      { to: "/admin/languages/update", label: "Update Languages" },
      { to: "/admin/languages/delete", label: "Delete Languages" },
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
    key: "skills",
    label: "Skills",
    icon: Sparkles,
    links: [
      { to: "/admin/skills/create", label: "Add Skill" },
      { to: "/admin/skills/view", label: "View Skills" },
      { to: "/admin/skills/update", label: "Update Skills" },
      { to: "/admin/skills/delete", label: "Delete Skills" },
    ],
  },
  {
  key: "promotions",
  label: "Promotions",
  icon: Megaphone,
  links: [
    {
      to: "/admin/promotions/create",
      label: "Create Promotion",
    },
    {
      to: "/admin/promotions/view",
      label: "View Promotions",
    },
    {
      to: "/admin/promotions/update",
      label: "Update Promotions",
    },
    {
      to: "/admin/promotions/delete",
      label: "Delete Promotions",
    },
  ],
},
  {
    key: "about",
    label: "About",
    icon: Info,
    links: [
      { to: "/admin/about/create", label: "Create About" },
      { to: "/admin/about/view", label: "View About" },
      { to: "/admin/about/update", label: "Update About" },
    ],
  },
];

const AdminSidebar = ({ setLoggedIn, setIsAdmin }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const matchedSection = SECTIONS.find((s) =>
    s.links.some((l) => location?.pathname?.startsWith(l.to))
  )?.key;

  const [activeSection, setActiveSection] = useState(matchedSection ?? "landing");

  const currentSection = SECTIONS.find((s) => s.key === activeSection) ?? SECTIONS[0];

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setIsAdmin(false);
    navigate("/");
  };

  const goToDashboard = () => {
    navigate("/admin/dashboard");
  };

  const onDashboard = location?.pathname === "/admin/dashboard";

  return (
    <>
      {ReactDOM.createPortal(
        <>
          <div
            style={{
              width: "84px",
              background: "#ffffff",
              borderRight: "1px solid #e5e7eb",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flexShrink: 0,
              height: "100vh",
              position: "fixed",
              top: 0,
              left: 0,
              overflow: "hidden",
              zIndex: 30,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            <div
              style={{
                flex: 1,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                overflowY: "auto",
                overflowX: "hidden",
                minHeight: 0,
                paddingTop: "16px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "#e6f6ec",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "14px",
                  marginBottom: "20px",
                  flexShrink: 0,
                }}
              >
                A
              </div>

              <button
                onClick={goToDashboard}
                title="Dashboard"
                style={{
                  width: "48px",
                  height: "48px",
                  marginBottom: "6px",
                  flexShrink: 0,
                  background: "transparent",
                  border: "none",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  cursor: "pointer",
                  color: onDashboard ? "#16a34a" : "#64748b",
                  transition: "background 0.15s ease, color 0.15s ease",
                  outline: "none",
                  WebkitTapHighlightColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <LayoutDashboard size={19} />
                <span style={{ fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.01em" }}>
                  Dashboard
                </span>
              </button>

              <div style={{ width: "36px", height: "1px", background: "#e5e7eb", marginBottom: "10px", flexShrink: 0 }} />

              {SECTIONS.map(({ key, label, icon: Icon }) => {
                const isActive = key === activeSection;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    title={label}
                    style={{
                      width: "48px",
                      height: "48px",
                      marginBottom: "6px",
                      flexShrink: 0,
                      background: "transparent",
                      border: "none",
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      cursor: "pointer",
                      color: isActive ? "#16a34a" : "#64748b",
                      transition: "background 0.15s ease, color 0.15s ease",
                      outline: "none",
                      WebkitTapHighlightColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Icon size={19} />
                    <span style={{ fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.01em" }}>
                      {label.length > 8 ? label.split(" ")[0] : label}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              style={{
                width: "48px",
                height: "48px",
                marginBottom: "16px",
                marginTop: "6px",
                flexShrink: 0,
                background: "transparent",
                border: "none",
                borderLeft: "3px solid transparent",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                cursor: "pointer",
                color: "#64748b",
                transition: "background 0.15s ease, color 0.15s ease",
                outline: "none",
                WebkitTapHighlightColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fef2f2";
                e.currentTarget.style.color = "#dc2626";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#64748b";
              }}
            >
              <LogOut size={19} />
              <span style={{ fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.01em" }}>
                Logout
              </span>
            </button>
          </div>

          <div
            style={{
              position: "fixed",
              top: 0,
              left: "84px",
              height: "100vh",
              width: "230px",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderLeft: "none",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              zIndex: 20,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            <div
              style={{
                padding: "20px 20px 14px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <span style={{ color: "#0f172a", fontWeight: 700, fontSize: "17.5px" }}>
                {currentSection.label}
              </span>
            </div>

            <nav style={{ padding: "10px", flex: 1, overflowY: "auto", minHeight: 0 }}>
              {currentSection.links.map(({ to, label: linkLabel }) => {
                const active = location?.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    style={{
                      display: "block",
                      padding: "10px 12px",
                      marginBottom: "2px",
                      borderRadius: "6px",
                      textDecoration: "none",
                      color: active ? "#16a34a" : "#475569",
                      fontWeight: active ? 600 : 500,
                      fontSize: "16px",
                      background: "transparent",
                      transition: "background 0.15s ease, color 0.15s ease",
                      outline: "none",
                      WebkitTapHighlightColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "#f8fafc";
                        e.currentTarget.style.color = "#0f172a";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#475569";
                      }
                    }}
                  >
                    {linkLabel}
                  </Link>
                );
              })}
            </nav>

            <div style={{ padding: "10px", borderTop: "1px solid #e5e7eb" }}>
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: "transparent",
                  color: "#dc2626",
                  fontWeight: 600,
                  fontSize: "16px",
                  cursor: "pointer",
                  textAlign: "left",
                  outline: "none",
                  WebkitTapHighlightColor: "transparent",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      <main style={{ marginLeft: "314px", minHeight: "100vh", padding: "32px 40px", background: "#ffffff", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <Outlet />
      </main>
    </>
  );
};

export default AdminSidebar;