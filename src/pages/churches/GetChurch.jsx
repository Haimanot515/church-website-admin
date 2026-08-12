import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./GetChurch.css";

const GetChurch = () => {
  const { t } = useTranslation("translation", { keyPrefix: "getChurch" });

  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  const fetchChurches = async () => {
    try {
      setLoading(true);
      const res = await API.get("/churches");
      setChurches(res.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("errorMessage"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChurches();
  }, []);

  const handleDelete = async (id, churchName) => {
    const confirmed = window.confirm(t("deleteConfirm", { churchName }));
    if (!confirmed) return;

    try {
      setDeletingId(id);

      const token = localStorage.getItem("token");

      // Matches DELETE /api/churches/:id in churchRoutes.js
      await API.delete(`/churches/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove locally instead of refetching everything
      setChurches((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || t("deleteErrorMessage"));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p className="getChurch-loading">{t("loadingMessage")}</p>;

  return (
    <div className="getChurch-page">
      <div className="getChurch-card">
        <div className="getChurch-header">
          <h2 className="getChurch-title">{t("title")}</h2>
          <button
            onClick={() => navigate("/admin/churches/create")}
            className="getChurch-newButton"
          >
            {t("newChurchButton")}
          </button>
        </div>

        {error && <p className="getChurch-error">{error}</p>}

        {churches.length === 0 && !error && (
          <p className="getChurch-empty">{t("noChurchesMessage")}</p>
        )}

        <div className="getChurch-list">
          {churches.map((c) => (
            <div key={c._id} className="getChurch-row">
              <div className="getChurch-info">
                {c.image && (
                  <img src={c.image} alt={c.churchName} className="getChurch-thumb" />
                )}
                <div>
                  <strong className="getChurch-name">{c.churchName}</strong>
                  {c.isPrimary && (
                    <span className="getChurch-badge getChurch-badge--main">
                      {t("mainChurchBadge")}
                    </span>
                  )}
                  {c.isFeatured && (
                    <span className="getChurch-badge getChurch-badge--featured">
                      {t("featuredBadge")}
                    </span>
                  )}
                  <div className="getChurch-address">{c.address}</div>
                </div>
              </div>

              <div className="getChurch-actions">
                <button
                  onClick={() => navigate(`/admin/churches/update/${c._id}`)}
                  className="getChurch-editButton"
                >
                  {t("editButton")}
                </button>
                <button
                  onClick={() => handleDelete(c._id, c.churchName)}
                  disabled={deletingId === c._id}
                  className="getChurch-deleteButton"
                >
                  {deletingId === c._id ? t("deletingButton") : t("deleteButton")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GetChurch;