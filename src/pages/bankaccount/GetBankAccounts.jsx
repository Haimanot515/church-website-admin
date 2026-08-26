import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./GetBankAccounts.css";

const GetBankAccounts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);

      // Matches GET /api/bank-accounts -> getBankAccounts
      const res = await API.get("/bank-accounts");

      setAccounts(res.data.accounts || []);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("getBankAccounts.errors.load"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id, bank) => {
    const confirmed = window.confirm(t("getBankAccounts.confirmDelete", { bank }));
    if (!confirmed) return;

    try {
      setDeletingId(id);

      const token = localStorage.getItem("token");

      // Matches DELETE /api/bank-accounts/:id -> deleteBankAccount
      await API.delete(`/bank-accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAccounts((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || t("getBankAccounts.errors.delete"));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p className="gba-loading">{t("getBankAccounts.loadingAccounts")}</p>;

  return (
    <div className="gba-page">
      <div className="gba-card">
        <div className="gba-header">
          <h2>{t("getBankAccounts.heading")}</h2>

          <button className="gba-btn-new" onClick={() => navigate("/admin/bank-accounts/create")}>
            {t("getBankAccounts.newAccount")}
          </button>
        </div>

        {error && <p className="gba-error">{error}</p>}

        {accounts.length === 0 && !error && <p>{t("getBankAccounts.noAccounts")}</p>}

        <div className="gba-list">
          {accounts.map((a) => (
            <div key={a._id} className="gba-row">
              <div className="gba-row-info">
                <div className="gba-row-text">
                  <strong>{a.bank}</strong>
                  <div className="gba-account-name">{a.accountName}</div>
                  <div className="gba-account-number">{a.accountNumber}</div>
                </div>
              </div>

              <div className="gba-row-actions">
                <button
                  className="gba-btn-edit"
                  onClick={() => navigate(`/admin/bank-accounts/update/${a._id}`)}
                >
                  {t("getBankAccounts.actions.edit")}
                </button>

                <button
                  className="gba-btn-delete"
                  onClick={() => handleDelete(a._id, a.bank)}
                  disabled={deletingId === a._id}
                >
                  {deletingId === a._id
                    ? t("getBankAccounts.actions.deleting")
                    : t("getBankAccounts.actions.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GetBankAccounts;