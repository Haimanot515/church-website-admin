import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./GetPromotions.css";

const GetPromotions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);

      // Matches GET /api/promotions -> getPromotion
      const res = await API.get("/promotions");

      setPromotions(res.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("getPromotions.errors.load"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(t("getPromotions.confirmDelete", { title }));
    if (!confirmed) return;

    try {
      setDeletingId(id);

      const token = localStorage.getItem("token");

      // Matches DELETE /api/promotions/:id -> deletePromotion
      await API.delete(`/promotions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPromotions((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || t("getPromotions.errors.delete"));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p className="gp-loading">{t("getPromotions.loadingPromotions")}</p>;

  return (
    <div className="gp-page">
      <div className="gp-card">
        <div className="gp-header">
          <h2>{t("getPromotions.heading")}</h2>

          <button className="gp-btn-new" onClick={() => navigate("/admin/promotions/new")}>
            {t("getPromotions.newPromotion")}
          </button>
        </div>

        {error && <p className="gp-error">{error}</p>}

        {promotions.length === 0 && !error && <p>{t("getPromotions.noPromotions")}</p>}

        <div className="gp-list">
          {promotions.map((p) => (
            <div key={p._id} className="gp-row">
              <div className="gp-row-info">
                {p.photo && <img src={p.photo} alt={p.title} className="gp-thumb" />}

                <div className="gp-row-text">
                  <strong>{p.title}</strong>
                  <div className="gp-description">{p.description}</div>
                </div>
              </div>

              <div className="gp-row-actions">
                <button
                  className="gp-btn-edit"
                  onClick={() => navigate(`/admin/promotions/${p._id}/edit`)}
                >
                  {t("getPromotions.actions.edit")}
                </button>

                <button
                  className="gp-btn-delete"
                  onClick={() => handleDelete(p._id, p.title)}
                  disabled={deletingId === p._id}
                >
                  {deletingId === p._id
                    ? t("getPromotions.actions.deleting")
                    : t("getPromotions.actions.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GetPromotions;