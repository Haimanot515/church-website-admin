import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import { RichTextProvider } from "../../components/textEditor/RichTextContext";
import RichTextToolbar from "../../components/textEditor/RichTextToolbar";
import RichTextContextMenu from "../../components/textEditor/RichTextContextMenu";
import RichTextField from "../../components/textEditor/RichTextField";
import "./CreateLanguage.css";
import "../shared/AdminShared.css";

// Strips HTML tags for plain-text validation checks
const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

const CreateLanguage = () => {
  const { t } = useTranslation();

  const [language, setLanguage] = useState({
    name: "",
    code: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLanguage((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // RichTextField is a contenteditable, not an <input>, so it can't rely
    // on the native `required` attribute — check the plain-text content instead.
    if (!stripHtml(language.name)) {
      setError(t("createLanguage.errors.nameRequired"));
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await API.post(
        "/languages",
        {
          name: language.name,
          code: language.code.toUpperCase(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(t("createLanguage.successMessage"));
      setLanguage({ name: "", code: "" });
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("createLanguage.errors.create"));
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    { name: t("createLanguage.examples.english"), code: "EN" },
    { name: t("createLanguage.examples.amharic"), code: "AM" },
    { name: t("createLanguage.examples.italian"), code: "IT" },
  ];

  return (
    <div className="cl-page">
      <div className="cl-card rte-page-shell">
        <RichTextProvider>
        <div className="rte-editor-shell">
          <RichTextToolbar />
          <RichTextContextMenu />
          <div className="rte-scroll-area">
            <h2>{t("createLanguage.heading")}</h2>

            {error && <p className="cl-error">{error}</p>}

            <form onSubmit={handleSubmit} className="cl-form">
              <RichTextField
                value={language.name}
                onChange={(html) => setLanguage((prev) => ({ ...prev, name: html }))}
                placeholder={t("createLanguage.form.namePlaceholder")}
                minHeight="44px"
                toolbar="minimal"
                autoFocus
              />

              <input
                type="text"
                name="code"
                placeholder={t("createLanguage.form.codePlaceholder")}
                value={language.code}
                onChange={handleChange}
                required
                className="cl-code-input"
              />

              <button type="submit" disabled={loading} className="cl-btn-primary">
                {loading ? t("createLanguage.form.creating") : t("createLanguage.form.createButton")}
              </button>
            </form>

            <div className="cl-examples">
              <h4>{t("createLanguage.examples.heading")}</h4>

              <div className="cl-table-wrap">
                <table className="cl-table">
                  <thead>
                    <tr>
                      <th>{t("createLanguage.examples.table.name")}</th>
                      <th>{t("createLanguage.examples.table.code")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examples.map((ex) => (
                      <tr key={ex.code}>
                        <td data-label={t("createLanguage.examples.table.name")}>{ex.name}</td>
                        <td data-label={t("createLanguage.examples.table.code")}>{ex.code}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        </RichTextProvider>
      </div>
    </div>
  );
};

export default CreateLanguage;