import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./CreateBankAccount.css";
import "../shared/AdminShared.css";

import { RichTextProvider } from "../../components/textEditor/RichTextContext";
import RichTextToolbar from "../../components/textEditor/RichTextToolbar";
import RichTextContextMenu from "../../components/textEditor/RichTextContextMenu";
import RichTextField from "../../components/textEditor/RichTextField";

// Fields are stored as rich-text HTML — strip tags for plain-text checks and list display
const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

const CreateBankAccount = () => {
  const { t } = useTranslation();
  const [account, setAccount] = useState({
    bank: "",
    accountName: "",
    accountNumber: "",
    order: 0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!account.bank || !account.accountName || !account.accountNumber) {
      setError(t("createBankAccount.errors.requiredFields"));
      return;
    }

    if (!stripHtml(account.bank)) {
      setError("Bank is required");
      return;
    }
    if (!stripHtml(account.accountName)) {
      setError("AccountName is required");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await API.post(
        "/bank-accounts",
        {
          bank: account.bank,
          accountName: account.accountName,
          accountNumber: account.accountNumber,
          order: Number(account.order) || 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(t("createBankAccount.successMessage"));
      setAccount({
        bank: "",
        accountName: "",
        accountNumber: "",
        order: 0,
      });
    } catch (error) {
      console.log(error);
      setError(
        error.response?.data?.message || t("createBankAccount.errors.create")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cba-page">
      <div className="cba-card rte-page-shell">
        <h2>{t("createBankAccount.heading")}</h2>

        {error && <p className="cba-error">{error}</p>}

        <RichTextProvider>
          <div className="rte-editor-shell">
            <RichTextToolbar />
            <RichTextContextMenu />
            <div className="rte-scroll-area">
              <form onSubmit={handleSubmit} className="cba-form">
              <RichTextField
                id="rt-bank"
                value={account.bank}
                onChange={(html) => setAccount((prev) => ({ ...prev, bank: html }))}
                placeholder={t("createBankAccount.form.bankPlaceholder")}
                minHeight="44px"
                toolbar="minimal"
              />
    
              <RichTextField
                id="rt-accountName"
                value={account.accountName}
                onChange={(html) => setAccount((prev) => ({ ...prev, accountName: html }))}
                placeholder={t("createBankAccount.form.accountNamePlaceholder")}
                minHeight="44px"
                toolbar="minimal"
              />
    
              <input
                type="text"
                name="accountNumber"
                placeholder={t("createBankAccount.form.accountNumberPlaceholder")}
                value={account.accountNumber}
                onChange={handleChange}
                required
              />
    
              <input
                type="number"
                name="order"
                placeholder={t("createBankAccount.form.orderPlaceholder")}
                value={account.order}
                onChange={handleChange}
              />
    
              <button type="submit" disabled={loading} className="cba-btn-primary">
                {loading
                  ? t("createBankAccount.form.creating")
                  : t("createBankAccount.form.createButton")}
              </button>
            </form>
            </div>
          </div>
        </RichTextProvider>
      </div>
    </div>
  );
};

export default CreateBankAccount;