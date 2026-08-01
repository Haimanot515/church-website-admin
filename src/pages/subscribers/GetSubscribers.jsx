import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./GetSubscribers.css";

const GetSubscribers = () => {
  const { t, i18n } = useTranslation();

  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingEmail, setRemovingEmail] = useState(null);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // Matches GET /api/subscribers -> getAllSubscribers
      const res = await API.get("/subscribers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSubscribers(res.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.msg || t("getSubscribers.errors.load"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnsubscribe = async (id, email) => {
    const confirmed = window.confirm(t("getSubscribers.confirmUnsubscribe", { email }));
    if (!confirmed) return;

    try {
      setRemovingEmail(email);

      // Matches GET /api/subscribers/unsubscribe -> unsubscribe
      await API.get("/subscribers/unsubscribe", {
        params: { email },
      });

      setSubscribers((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.msg || t("getSubscribers.errors.unsubscribe"));
    } finally {
      setRemovingEmail(null);
    }
  };

  if (loading) return <p className="gs-loading">{t("getSubscribers.loadingSubscribers")}</p>;

  return (
    <div className="gs-page">
      <div className="gs-card">
        <div className="gs-header">
          <h2>{t("getSubscribers.heading")}</h2>

          <span className="gs-count">
            {t("getSubscribers.activeCount", { count: subscribers.length })}
          </span>
        </div>

        {error && <p className="gs-error">{error}</p>}

        {subscribers.length === 0 && !error && <p>{t("getSubscribers.noSubscribers")}</p>}

        <div className="gs-list">
          {subscribers.map((s) => (
            <div key={s._id} className="gs-row">
              <div className="gs-row-text">
                <strong>{s.email}</strong>
                <div className="gs-subscribed-date">
                  {t("getSubscribers.subscribedOn", {
                    date: new Date(s.subscribedAt).toLocaleDateString(i18n.language),
                  })}
                </div>
              </div>

              <button
                className="gs-btn-unsubscribe"
                onClick={() => handleUnsubscribe(s._id, s.email)}
                disabled={removingEmail === s.email}
              >
                {removingEmail === s.email
                  ? t("getSubscribers.actions.removing")
                  : t("getSubscribers.actions.unsubscribe")}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GetSubscribers;