import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./GetService.css";
import "../shared/AdminShared.css";
import ActionMenu from "../../components/ActionMenu";

// Title is now stored as RichTextField HTML — strip tags for the plain-text card heading
const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

const GetService = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/services");
      // API may return a bare array or an object like { services: [...] }
      setServices(Array.isArray(res.data) ? res.data : res.data.services || []);
    } catch (err) {
      setError(err.response?.data?.message || t("getService.errors.load"));
    } finally {
      setLoading(false);
    }
  };

  // --- Edit: redirect to the UpdateService page (matches the
  // "services/update/:id" route registered in App.jsx) ---
  // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
  const handleEditClick = (service) => {
    navigate(`/admin/services/update/${service.id}`);
  };

  // --- Delete ---
  const handleDelete = async (id) => {
    if (!window.confirm(t("getService.confirmDelete"))) return;

    try {
      setDeletingId(id);

      await API.delete(`/services/${id}`);

      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || t("getService.errors.delete"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (service) => {
    const newStatus = service.status === "active" ? "inactive" : "active";

    try {
      await API.put(`/services/${service.id}`, { status: newStatus });
      await fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || t("getService.errors.updateStatus"));
    }
  };

  if (loading) return <p className="ms-page">{t("getService.loading")}</p>;
  if (error) return <p className="ms-page ms-error">{error}</p>;

  return (
    <div className="ms-page">
      <h2 className="ms-heading">{t("getService.heading")}</h2>

      {services.length === 0 ? (
        <p>{t("getService.noServices")}</p>
      ) : (
        <div className="ms-list">
          {services.map((service) => (
            <div key={service.id} className="ms-card">
              <div>
                <h3 className="ms-card-title">{stripHtml(service.title) || "—"}</h3>
                <p className="ms-card-meta">
                  {service.schedule} · {service.category} ·{" "}
                  <strong
                    className={
                      service.status === "active" ? "ms-status-active" : "ms-status-inactive"
                    }
                  >
                    {service.status === "active"
                      ? t("getService.status.active")
                      : t("getService.status.inactive")}
                  </strong>
                </p>
              </div>

              <div className="ms-card-actions">
                <ActionMenu
                  items={[
                    {
                      label: t("getService.actions.edit"),
                      onClick: () => handleEditClick(service),
                      tone: "edit",
                    },
                    {
                      label: service.status === "active" ? t("getService.actions.makeInactive") : t("getService.actions.makeActive"),
                      onClick: () => handleToggleStatus(service),
                      tone: service.status === "active" ? "warning" : "success",
                    },
                    {
                      label: deletingId === service.id ? t("getService.actions.deleting") : t("getService.actions.delete"),
                      onClick: () => handleDelete(service.id),
                      tone: "delete",
                      disabled: deletingId === service.id,
                    },
                  ]}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GetService;