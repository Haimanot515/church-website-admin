import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./GetBankAccounts.css";
import "../shared/AdminShared.css";

import { RichTextProvider } from "../../components/textEditor/RichTextContext";
import RichTextToolbar from "../../components/textEditor/RichTextToolbar";
import RichTextContextMenu from "../../components/textEditor/RichTextContextMenu";
import RichTextField from "../../components/textEditor/RichTextField";
import ActionMenu from "../../components/ActionMenu";

// Fields are stored as rich-text HTML — strip tags for plain-text checks and list display
const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");
const GetBankAccounts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    bank: "",
    accountName: "",
    accountNumber: "",
    order: 0,
  });
  const [savingId, setSavingId] = useState(null);
  const [editError, setEditError] = useState("");

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

  const startEdit = (account) => {
    // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
    setEditingId(account.id);
    setEditError("");
    setEditForm({
      bank: account.bank,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      order: account.order ?? 0,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (id) => {
    setEditError("");

    if (!stripHtml(editForm.bank) || !stripHtml(editForm.accountName) || !editForm.accountNumber) {
      setEditError(t("getBankAccounts.errors.requiredFields"));
      return;
    }

    try {
      setSavingId(id);

      const token = localStorage.getItem("token");

      // Matches PUT /api/bank-accounts/:id -> updateBankAccount
      const res = await API.put(
        `/bank-accounts/${id}`,
        {
          bank: editForm.bank,
          accountName: editForm.accountName,
          accountNumber: editForm.accountNumber,
          order: Number(editForm.order) || 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? res.data : a))
      );
      setEditingId(null);
    } catch (err) {
      console.log(err);
      setEditError(err.response?.data?.message || t("getBankAccounts.errors.update"));
    } finally {
      setSavingId(null);
    }
  };

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

      // PostgreSQL/Prisma returns `id`, not MongoDB `_id`
      setAccounts((prev) => prev.filter((a) => a.id !== id));
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
      <div className="gba-card rte-page-shell">
        <div className="gba-header">
          <h2>{t("getBankAccounts.heading")}</h2>

          <button className="gba-btn-new" onClick={() => navigate("/admin/bank-accounts/create")}>
            {t("getBankAccounts.newAccount")}
          </button>
        </div>

        {error && <p className="gba-error">{error}</p>}

        {accounts.length === 0 && !error && <p>{t("getBankAccounts.noAccounts")}</p>}

        <div className="gba-list">
          {accounts.map((a) => {
            const isEditing = editingId === a.id;

            return (
              <div key={a.id} className="gba-row">
                {isEditing ? (
                  <RichTextProvider>
                  <div className="rte-editor-shell">
                    <RichTextToolbar />
                    <RichTextContextMenu />
                    <div className="gba-edit-form rte-scroll-area">
                    {editError && <p className="gba-error">{editError}</p>}

                    <RichTextField
                      id="rt-edit-bank"
                      value={editForm.bank}
                      onChange={(html) => setEditForm((prev) => ({ ...prev, bank: html }))}
                      placeholder={t("createBankAccount.form.bankPlaceholder")}
                      minHeight="44px"
                      toolbar="minimal"
                    />

                    <RichTextField
                      id="rt-edit-accountName"
                      value={editForm.accountName}
                      onChange={(html) => setEditForm((prev) => ({ ...prev, accountName: html }))}
                      placeholder={t("createBankAccount.form.accountNamePlaceholder")}
                      minHeight="44px"
                      toolbar="minimal"
                    />

                    <input
                      type="text"
                      name="accountNumber"
                      value={editForm.accountNumber}
                      onChange={handleEditChange}
                      placeholder={t("createBankAccount.form.accountNumberPlaceholder")}
                    />

                    <input
                      type="number"
                      name="order"
                      value={editForm.order}
                      onChange={handleEditChange}
                      placeholder={t("createBankAccount.form.orderPlaceholder")}
                    />

                    <div className="gba-row-actions">
                      <button
                        className="gba-btn-edit"
                        onClick={() => handleUpdate(a.id)}
                        disabled={savingId === a.id}
                      >
                        {savingId === a.id
                          ? t("getBankAccounts.actions.saving")
                          : t("getBankAccounts.actions.save")}
                      </button>

                      <button className="gba-btn-cancel" onClick={cancelEdit}>
                        {t("getBankAccounts.actions.cancel")}
                      </button>
                    </div>
                    </div>
                  </div>
                </RichTextProvider>
                ) : (
                  <>
                    <div className="gba-row-info">
                      <div className="gba-row-text">
                        <strong>{stripHtml(a.bank)}</strong>
                        <div className="gba-account-name">{stripHtml(a.accountName)}</div>
                        <div className="gba-account-number">{a.accountNumber}</div>
                      </div>
                    </div>

                    <div className="gba-row-actions">
                      <ActionMenu
                        items={[
                          {
                            label: t("getBankAccounts.actions.edit"),
                            onClick: () => startEdit(a),
                            tone: "edit",
                          },
                          {
                            label: deletingId === a.id ? t("getBankAccounts.actions.deleting") : t("getBankAccounts.actions.delete"),
                            onClick: () => handleDelete(a.id, a.bank),
                            tone: "delete",
                            disabled: deletingId === a.id,
                          },
                        ]}
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GetBankAccounts;