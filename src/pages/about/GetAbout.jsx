import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./GetAbout.css";

const ENTRIES_PER_PAGE = 10;

const emptyForm = {
  title: "",
  churchLeader: "",
  description: "",
  image: null,
};

const GetAbout = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const editPanelRef = useRef(null);

  useEffect(() => {
    fetchAbout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAbout = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/about");
      setAllEntries(res.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("getAbout.errors.load"));
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(allEntries.length / ENTRIES_PER_PAGE));
  const entries = allEntries.slice(
    (currentPage - 1) * ENTRIES_PER_PAGE,
    currentPage * ENTRIES_PER_PAGE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // --- Edit (inline, no navigation) ---
  const handleEditClick = (entry) => {
    setEditingId(entry._id);
    setFormError("");
    setForm({
      title: entry.title || "",
      churchLeader: entry.churchLeader || "",
      description: entry.description || "",
      image: null,
    });
    setExistingImageUrl(entry.image || "");
    setPreview(null);

    requestAnimationFrame(() => {
      editPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPreview(null);
    setExistingImageUrl("");
    setFormError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, image: file }));
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    setFormError("");

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("churchLeader", form.churchLeader);
      formData.append("description", form.description);

      if (form.image) {
        formData.append("image", form.image);
      }

      await API.put(`/about/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(t("getAbout.updateSuccess"));
      handleCancelEdit();
      await fetchAbout();
    } catch (err) {
      console.log(err);
      setFormError(err.response?.data?.message || t("getAbout.errors.update"));
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete ---
  const handleDelete = async (id) => {
    if (!window.confirm(t("getAbout.confirmDelete"))) {
      return;
    }

    try {
      setDeletingId(id);

      await API.delete(`/about/${id}`);

      if (editingId === id) {
        handleCancelEdit();
      }

      await fetchAbout();

      // If deleting the last item on a page, step back a page
      const remaining = allEntries.length - 1;
      const newTotalPages = Math.max(1, Math.ceil(remaining / ENTRIES_PER_PAGE));
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("getAbout.errors.delete"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="ga-page">
      <div className="ga-card">
        <div className="ga-header">
          <h2>{t("getAbout.heading")}</h2>

          {!editingId && (
            <button className="ga-btn-new" onClick={() => navigate("/admin/about/create")}>
              {t("getAbout.newAbout")}
            </button>
          )}
        </div>

        {error && <p className="ga-error">{error}</p>}

        {editingId && (
          <div ref={editPanelRef} className="ga-edit-panel">
            <h3>{t("getAbout.editHeading")}</h3>

            {formError && <p className="ga-error">{formError}</p>}

            <form onSubmit={handleSubmit} className="ga-form">
              <input
                type="text"
                name="title"
                placeholder={t("getAbout.form.titlePlaceholder")}
                value={form.title}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="churchLeader"
                placeholder={t("getAbout.form.churchLeaderPlaceholder")}
                value={form.churchLeader}
                onChange={handleChange}
              />

              <textarea
                name="description"
                placeholder={t("getAbout.form.descriptionPlaceholder")}
                value={form.description}
                onChange={handleChange}
                rows="6"
                required
              />

              <input type="file" accept="image/*" onChange={handleFileChange} className="ga-file-input" />

              {(preview || existingImageUrl) && (
                <img
                  src={preview || existingImageUrl}
                  alt={t("getAbout.previewAlt")}
                  className="ga-preview"
                />
              )}

              <div className="ga-form-actions">
                <button type="submit" disabled={submitting} className="ga-btn-primary">
                  {submitting ? t("getAbout.form.saving") : t("getAbout.form.saveChanges")}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="ga-btn-cancel"
                >
                  {t("getAbout.form.cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        {!editingId &&
          (loading ? (
            <p>{t("getAbout.loadingEntries")}</p>
          ) : allEntries.length === 0 ? (
            <p>{t("getAbout.noEntries")}</p>
          ) : (
            <>
              <div className="ga-table-wrap">
                <table className="ga-table">
                  <thead>
                    <tr>
                      <th>{t("getAbout.table.title")}</th>
                      <th>{t("getAbout.table.churchLeader")}</th>
                      <th>{t("getAbout.table.description")}</th>
                      <th>{t("getAbout.table.created")}</th>
                      <th>{t("getAbout.table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry._id}>
                        <td data-label={t("getAbout.table.title")}>{entry.title}</td>
                        <td data-label={t("getAbout.table.churchLeader")}>{entry.churchLeader || "—"}</td>
                        <td data-label={t("getAbout.table.description")}>
                          {entry.description
                            ? entry.description.length > 60
                              ? `${entry.description.slice(0, 60)}...`
                              : entry.description
                            : "—"}
                        </td>
                        <td data-label={t("getAbout.table.created")}>
                          {entry.createdAt
                            ? new Date(entry.createdAt).toLocaleDateString(i18n.language)
                            : "—"}
                        </td>
                        <td data-label={t("getAbout.table.actions")}>
                          <div className="ga-row-actions">
                            <button className="ga-btn-edit" onClick={() => handleEditClick(entry)}>
                              {t("getAbout.actions.edit")}
                            </button>

                            <button
                              className="ga-btn-delete"
                              onClick={() => handleDelete(entry._id)}
                              disabled={deletingId === entry._id}
                            >
                              {deletingId === entry._id
                                ? t("getAbout.actions.deleting")
                                : t("getAbout.actions.delete")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="ga-pagination">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="ga-page-btn"
                  >
                    {t("getAbout.pagination.prev")}
                  </button>

                  <span className="ga-page-info">
                    {t("getAbout.pagination.pageOf", { current: currentPage, total: totalPages })}
                  </span>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ga-page-btn"
                  >
                    {t("getAbout.pagination.next")}
                  </button>
                </div>
              )}
            </>
          ))}
      </div>
    </div>
  );
};

export default GetAbout;