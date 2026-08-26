import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./CreateBankAccount.css";

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
      <div className="cba-card">
        <h2>{t("createBankAccount.heading")}</h2>

        {error && <p className="cba-error">{error}</p>}

        <form onSubmit={handleSubmit} className="cba-form">
          <input
            type="text"
            name="bank"
            placeholder={t("createBankAccount.form.bankPlaceholder")}
            value={account.bank}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="accountName"
            placeholder={t("createBankAccount.form.accountNamePlaceholder")}
            value={account.accountName}
            onChange={handleChange}
            required
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
  );
};

export default CreateBankAccount;