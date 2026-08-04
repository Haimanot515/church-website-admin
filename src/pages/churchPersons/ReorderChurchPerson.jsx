import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/api";
import "./reorderChurchPerson.css";

const CATEGORY_KEYS = ["leader", "specialThanks", "testimony"];

const ReorderChurchPerson = () => {
  const { t } = useTranslation();

  const [category, setCategory] = useState("leader");
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const dragIndex = useRef(null);

  useEffect(() => {
    fetchPersons(category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const fetchPersons = async (cat) => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await API.get("/church-persons", { params: { category: cat } });
      const sorted = [...res.data].sort((a, b) => (a.rankOrder ?? 0) - (b.rankOrder ?? 0));
      setPersons(sorted);
      setDirty(false);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("reorderChurchPerson.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  const movePerson = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= persons.length || fromIndex === toIndex) return;

    setPersons((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setDirty(true);
    setMessage("");
  };

  const moveUp = (index) => movePerson(index, index - 1);
  const moveDown = (index) => movePerson(index, index + 1);

  // --- Native HTML5 drag and drop (desktop / tablet only, hidden on mobile) ---
  const handleDragStart = (index) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragOverIndex !== index) setDragOverIndex(index);
  };

  const handleDragLeave = (index) => {
    setDragOverIndex((prev) => (prev === index ? null : prev));
  };

  const handleDrop = (index) => {
    if (dragIndex.current === null) return;
    movePerson(dragIndex.current, index);
    dragIndex.current = null;
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
    setDragOverIndex(null);
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await Promise.all(
        persons.map((person, index) =>
          API.put(`/church-persons/${person._id}`, { rankOrder: index })
        )
      );

      setMessage(t("reorderChurchPerson.successMessage"));
      setDirty(false);
      await fetchPersons(category);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || t("reorderChurchPerson.errorSave"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rcpPage">
      <div className="rcpCard">
        {/* Header */}
        <div className="rcpHeader">
          <div className="rcpHeaderText">
            <h2 className="rcpTitle">{t("reorderChurchPerson.title")}</h2>
            <p className="rcpSubtitle">{t("reorderChurchPerson.subtitle")}</p>
          </div>

          <button
            onClick={handleSaveOrder}
            disabled={!dirty || saving || loading}
            className="rcpSaveButton"
          >
            {saving
              ? t("reorderChurchPerson.saving")
              : dirty
              ? t("reorderChurchPerson.saveButton")
              : t("reorderChurchPerson.saved")}
          </button>
        </div>

        {/* Category tabs */}
        <div className="rcpTabs">
          {CATEGORY_KEYS.map((catKey) => {
            const active = category === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setCategory(catKey)}
                className={`rcpTabButton ${active ? "rcpTabButtonActive" : ""}`}
              >
                {t(`reorderChurchPerson.categories.${catKey}`)}
              </button>
            );
          })}
        </div>

        {error && <div className="rcpAlert rcpAlertError">{error}</div>}
        {message && <div className="rcpAlert rcpAlertSuccess">{message}</div>}

        {loading ? (
          <p className="rcpStatusText">{t("reorderChurchPerson.loading")}</p>
        ) : persons.length === 0 ? (
          <p className="rcpStatusText">{t("reorderChurchPerson.empty")}</p>
        ) : (
          <div className="rcpList">
            {persons.map((person, index) => {
              const isDragOver = dragOverIndex === index;
              return (
                <div
                  key={person._id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={() => handleDragLeave(index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  className={`rcpRow ${isDragOver ? "rcpRowDragOver" : ""}`}
                >
                  {/* Drag handle (hidden on mobile via CSS) */}
                  <span className="rcpDragHandle" title={t("reorderChurchPerson.dragHandle")}>
                    <span className="rcpDot" />
                    <span className="rcpDot" />
                    <span className="rcpDot" />
                  </span>

                  <span className="rcpRankBadge">{index + 1}</span>

                  {person.photos && person.photos[0] ? (
                    <img src={person.photos[0]} alt={person.name} className="rcpAvatar" />
                  ) : (
                    <div className="rcpAvatarPlaceholder" />
                  )}

                  <div className="rcpPersonInfo">
                    <div className="rcpPersonName">
                      {person.name || t("reorderChurchPerson.unnamed")}
                    </div>
                    <div className="rcpPersonMeta">
                      {[person.rank, person.role].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>

                  <div className="rcpArrowGroup">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      title={t("reorderChurchPerson.moveUp")}
                      className="rcpArrowButton"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === persons.length - 1}
                      title={t("reorderChurchPerson.moveDown")}
                      className="rcpArrowButton"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReorderChurchPerson;