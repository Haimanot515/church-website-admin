import React, { useState, useEffect, useRef } from "react";
import API from "../../api/api";

const CATEGORIES = [
  { value: "leader", label: "Leaders" },
  { value: "specialThanks", label: "Special Thanks" },
  { value: "testimony", label: "Testimonies" },
];

const GREEN = "#16a34a";
const GREEN_SOFT = "#e6f6ec";

const ReorderChurchPerson = () => {
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
      setError(err.response?.data?.message || "Failed to load church persons");
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

  // --- Native HTML5 drag and drop ---
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

      setMessage("Order saved successfully");
      setDirty(false);
      await fetchPersons(category);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to save new order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "30px", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div
        style={{
          maxWidth: "820px",
          margin: "auto",
          background: "#fff",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,.08)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "6px",
            gap: "16px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", color: "#0f172a" }}>Reorder Persons</h2>
            <p style={{ margin: "6px 0 0", fontSize: "13.5px", color: "#64748b" }}>
              Drag a row, or use the arrows, to change how people appear on the site.
            </p>
          </div>

          <button
            onClick={handleSaveOrder}
            disabled={!dirty || saving || loading}
            style={{
              padding: "11px 20px",
              background: !dirty || saving ? "#e5e7eb" : GREEN,
              color: !dirty || saving ? "#94a3b8" : "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: !dirty || saving ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: 600,
              whiteSpace: "nowrap",
              transition: "background 0.15s ease",
              flexShrink: 0,
            }}
          >
            {saving ? "Saving..." : dirty ? "Save Order" : "Saved"}
          </button>
        </div>

        {/* Category tabs */}
        <div
          style={{
            display: "inline-flex",
            background: "#f1f5f9",
            borderRadius: "10px",
            padding: "4px",
            marginTop: "20px",
            marginBottom: "22px",
          }}
        >
          {CATEGORIES.map((cat) => {
            const active = category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: active ? "#fff" : "transparent",
                  color: active ? GREEN : "#64748b",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: active ? "0 1px 3px rgba(0,0,0,.08)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "#fef2f2",
              borderLeft: "4px solid #dc2626",
              borderRadius: "6px",
              color: "#b91c1c",
              fontSize: "13.5px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            style={{
              padding: "10px 14px",
              background: GREEN_SOFT,
              borderLeft: `4px solid ${GREEN}`,
              borderRadius: "6px",
              color: "#15803d",
              fontSize: "13.5px",
              marginBottom: "16px",
            }}
          >
            {message}
          </div>
        )}

        {loading ? (
          <p style={{ color: "#64748b", fontSize: "14px" }}>Loading church persons...</p>
        ) : persons.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "14px" }}>No church persons found in this category.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "12px 14px",
                    border: isDragOver ? `1.5px solid ${GREEN}` : "1px solid #e2e8f0",
                    borderRadius: "10px",
                    background: isDragOver ? GREEN_SOFT : "#f8fafc",
                    cursor: "grab",
                    transition: "background 0.12s ease, border-color 0.12s ease",
                  }}
                >
                  {/* Drag handle */}
                  <span
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "3px",
                      color: "#cbd5e1",
                      cursor: "grab",
                      userSelect: "none",
                      lineHeight: 0,
                    }}
                    title="Drag to reorder"
                  >
                    <span style={dotRowStyle} />
                    <span style={dotRowStyle} />
                    <span style={dotRowStyle} />
                  </span>

                  <span
                    style={{
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "#fff",
                      background: GREEN,
                      width: "22px",
                      height: "22px",
                      borderRadius: "999px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>

                  {person.photos && person.photos[0] ? (
                    <img
                      src={person.photos[0]}
                      alt={person.name}
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        flexShrink: 0,
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "#e2e8f0",
                        flexShrink: 0,
                      }}
                    />
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "15px", color: "#0f172a" }}>
                      {person.name || "Unnamed"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      {[person.rank, person.role].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      title="Move up"
                      style={arrowButtonStyle(index === 0)}
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === persons.length - 1}
                      title="Move down"
                      style={arrowButtonStyle(index === persons.length - 1)}
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

const dotRowStyle = {
  width: "4px",
  height: "4px",
  borderRadius: "50%",
  background: "currentColor",
  display: "block",
};

const arrowButtonStyle = (disabled) => ({
  width: "30px",
  height: "30px",
  borderRadius: "7px",
  background: disabled ? "#e5e7eb" : "#fff",
  color: disabled ? "#cbd5e1" : "#334155",
  border: disabled ? "1px solid #e5e7eb" : "1px solid #cbd5e1",
  cursor: disabled ? "not-allowed" : "pointer",
  fontSize: "11px",
  transition: "background 0.12s ease",
});

export default ReorderChurchPerson;