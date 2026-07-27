import React, { useState, useEffect } from "react";
import API from "../../api/api";

const ROLE_OPTIONS = [
  "",
  "Founding Pastor",
  "Senior Pastor",
  "Associate Pastor",
  "Church Elder",
  "Ministry Assistant",
  "Worship Leader",
  "Small Group Leader",
  "Food Pantry Volunteer",
  "Worship Team Member",
  "Sunday School Teacher",
  "Choir Member",
  "Usher",
  "Treasurer",
  "Secretary",
  "Member",
];

const emptyForm = {
  name: "",
  title: "",
  description: "",
  role: "",
  message: "",
  category: "leader",
  rank: "",
  rankOrder: 0,
  files: [],
};

const UpdateChurchPerson = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [removingPhoto, setRemovingPhoto] = useState("");
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchPeople();
  }, []);

  // Revoke preview URLs whenever they change or we unmount
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/church-persons");

      setPeople(res.data);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to load church persons");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (person) => {
    setEditingId(person._id);
    setFormError("");
    setForm({
      name: person.name || "",
      title: person.title || "",
      description: person.description || "",
      role: person.role || "",
      message: person.message || "",
      category: person.category || "leader",
      rank: person.rank || "",
      rankOrder: person.rankOrder ?? 0,
      files: [],
    });
    setExistingPhotos(person.photos || []);
    setPreviews([]);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setExistingPhotos([]);
    setPreviews([]);
    setFormError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setForm((prev) => ({ ...prev, files: selectedFiles }));
    setPreviews(selectedFiles.map((f) => URL.createObjectURL(f)));
  };

  // Existing photos are removed immediately via the dedicated PATCH endpoint,
  // separate from saving the rest of the form.
  const handleRemoveExistingPhoto = async (photoUrl) => {
    if (!editingId) return;

    const confirmed = window.confirm("Remove this photo?");
    if (!confirmed) return;

    try {
      setRemovingPhoto(photoUrl);

      const res = await API.patch(`/church-persons/${editingId}/photo`, {
        photoUrl,
      });

      setExistingPhotos(res.data.photos || []);
      // Keep the underlying list in sync too
      setPeople((prev) =>
        prev.map((p) => (p._id === editingId ? { ...p, photos: res.data.photos } : p))
      );
    } catch (err) {
      console.log(err);
      setFormError(err.response?.data?.message || "Failed to remove photo");
    } finally {
      setRemovingPhoto("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    setFormError("");

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("role", form.role);
      formData.append("message", form.message);
      formData.append("category", form.category);

      if (form.rank) {
        formData.append("rank", form.rank);
      }

      formData.append("rankOrder", form.rankOrder);

      // New photos are appended to the existing set (replacePhotos not sent)
      if (form.files.length > 0) {
        form.files.forEach((file) => formData.append("photos", file));
      }

      await API.put(`/church-persons/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Church person updated successfully");
      handleCancelEdit();
      await fetchPeople();
    } catch (err) {
      console.log(err);
      setFormError(err.response?.data?.message || "Failed to update church person");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "30px" }}>
      <div
        style={{
          maxWidth: "1000px",
          margin: "auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,.1)",
        }}
      >
        <h2>Update Church Persons</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {editingId && (
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "25px",
              background: "#f8fafc",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Edit Church Person</h3>

            {formError && <p style={{ color: "red" }}>{formError}</p>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <select name="category" value={form.category} onChange={handleChange}>
                <option value="leader">Leader</option>
                <option value="specialThanks">Special Thanks</option>
                <option value="testimony">Testimony</option>
              </select>

              <input
                type="text"
                name="title"
                placeholder="Title (e.g. Associate Pastor, Small Group Leader)"
                value={form.title}
                onChange={handleChange}
              />

              <select name="role" value={form.role} onChange={handleChange}>
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "" ? "Select Role" : opt}
                  </option>
                ))}
              </select>

              <select name="rank" value={form.rank} onChange={handleChange}>
                <option value="">No Rank</option>
                <option value="patriarch">Patriarch</option>
                <option value="archbishop">Archbishop</option>
                <option value="bishop">Bishop</option>
                <option value="archpriest">Archpriest</option>
                <option value="priest">Priest</option>
                <option value="deacon">Deacon</option>
                <option value="subdeacon">Subdeacon</option>
                <option value="elder">Elder</option>
                <option value="member">Member</option>
              </select>

              <input
                type="number"
                name="rankOrder"
                placeholder="Rank order (lower = higher precedence)"
                value={form.rankOrder}
                onChange={handleChange}
                min="0"
              />

              <textarea
                name="description"
                placeholder="Short bio or description"
                rows="4"
                value={form.description}
                onChange={handleChange}
              />

              <textarea
                name="message"
                placeholder="Message / testimony quote (used for testimonies)"
                rows="4"
                value={form.message}
                onChange={handleChange}
              />

              {existingPhotos.length > 0 && (
                <div>
                  <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#64748b" }}>
                    Current photos — click Remove to delete individually
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {existingPhotos.map((url) => (
                      <div key={url} style={{ textAlign: "center" }}>
                        <img
                          src={url}
                          alt="existing"
                          style={{
                            width: "90px",
                            height: "90px",
                            objectFit: "cover",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingPhoto(url)}
                          disabled={removingPhoto === url}
                          style={{
                            marginTop: "4px",
                            padding: "3px 8px",
                            fontSize: "11px",
                            background: "#dc2626",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: removingPhoto === url ? "not-allowed" : "pointer",
                          }}
                        >
                          {removingPhoto === url ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#64748b" }}>
                  Add new photos (appended to the ones above)
                </p>
                <input type="file" accept="image/*" multiple onChange={handleFileChange} />
              </div>

              {previews.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {previews.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`preview-${i}`}
                      style={{
                        width: "90px",
                        height: "90px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "14px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  style={{
                    padding: "14px",
                    background: "#e5e7eb",
                    color: "#334155",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading church persons...</p>
        ) : people.length === 0 ? (
          <p>No church persons found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
            <thead>
              <tr>
                <th style={thStyle}>Photo</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Role / Title</th>
                <th style={thStyle}>Rank Order</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => (
                <tr key={person._id} style={editingId === person._id ? { background: "#eff6ff" } : undefined}>
                  <td style={tdStyle}>
                    {person.photos && person.photos.length > 0 ? (
                      <img
                        src={person.photos[0]}
                        alt={person.name}
                        style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "50%" }}
                      />
                    ) : (
                      <span style={{ color: "#94a3b8" }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>{person.name}</td>
                  <td style={tdStyle}>{person.category}</td>
                  <td style={tdStyle}>{person.title || person.role || "—"}</td>
                  <td style={tdStyle}>{person.rankOrder}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleEditClick(person)}
                      style={{
                        padding: "6px 12px",
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const thStyle = {
  textAlign: "left",
  padding: "10px",
  borderBottom: "2px solid #e2e8f0",
  fontSize: "13px",
  color: "#555",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
  fontSize: "14px",
};

export default UpdateChurchPerson;