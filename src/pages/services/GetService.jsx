import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./GetService.css";

const GetService = () => {
  const { t } = useTranslation();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await API.get("/services");
      // API may return a bare array or an object like { services: [...] }
      setServices(Array.isArray(res.data) ? res.data : res.data.services || []);
    } catch (err) {
      setError(err.response?.data?.message || t("getService.errors.load"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(t("getService.confirmDelete"))) return;

    try {
      await API.delete(`/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(services.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || t("getService.errors.delete"));
    }
  };

  const handleToggleStatus = async (service) => {
    const newStatus = service.status === "active" ? "inactive" : "active";

    try {
      const res = await API.put(
        `/services/${service._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setServices(services.map((s) => (s._id === service._id ? res.data : s)));
    } catch (err) {
      alert(err.response?.data?.message || t("getService.errors.updateStatus"));
    }
  };

  const handleEdit = (id) => {
    window.location.href = `/admin/services/update/${id}`;
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
            <div key={service._id} className="ms-card">
              <div>
                <h3 className="ms-card-title">{service.title}</h3>
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
                <button className="ms-btn ms-btn-edit" onClick={() => handleEdit(service._id)}>
                  {t("getService.actions.edit")}
                </button>

                <button
                  className={`ms-btn ${
                    service.status === "active" ? "ms-btn-toggle-active" : "ms-btn-toggle-inactive"
                  }`}
                  onClick={() => handleToggleStatus(service)}
                >
                  {service.status === "active"
                    ? t("getService.actions.makeInactive")
                    : t("getService.actions.makeActive")}
                </button>

                <button className="ms-btn ms-btn-delete" onClick={() => handleDelete(service._id)}>
                  {t("getService.actions.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GetService;