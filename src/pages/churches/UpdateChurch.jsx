import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";

const UpdateChurch = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [church, setChurch] = useState({
    churchName: "",
    shortDescription: "",
    description: "",
    history: "",
    address: "",
    phone: "",
    email: "",
    serviceDays: "",
    serviceTime: "",
    isFeatured: false,
    isPrimary: false,
    image: null, // new file, if replaced
  });

  const [existingImage, setExistingImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load the existing church so the form is pre-filled
  useEffect(() => {
    const fetchChurch = async () => {
      try {
        const res = await API.get(`/churches/${id}`);
        const c = res.data;

        setChurch({
          churchName: c.churchName || "",
          shortDescription: c.shortDescription || "",
          description: c.description || "",
          history: c.history || "",
          address: c.address || "",
          phone: c.phone || "",
          email: c.email || "",
          serviceDays: c.serviceDays || "",
          serviceTime: c.serviceTime || "",
          isFeatured: !!c.isFeatured,
          isPrimary: !!c.isPrimary,
          image: null,
        });

        setExistingImage(c.image || null);
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message || "Failed to load church");
      } finally {
        setFetching(false);
      }
    };

    fetchChurch();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setChurch({
      ...church,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setChurch({ ...church, image: file });
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("churchName", church.churchName);
      formData.append("shortDescription", church.shortDescription);
      formData.append("description", church.description);
      formData.append("history", church.history);
      formData.append("address", church.address);
      formData.append("phone", church.phone);
      formData.append("email", church.email);
      formData.append("serviceDays", church.serviceDays);
      formData.append("serviceTime", church.serviceTime);
      formData.append("isFeatured", church.isFeatured);
      formData.append("isPrimary", church.isPrimary);

      // Only send a new image if the admin picked one; otherwise the
      // controller keeps the existing image (it only overwrites when
      // req.file is present).
      if (church.image) {
        formData.append("image", church.image);
      }

      const token = localStorage.getItem("token");

      // Matches PUT /api/churches/:id in churchRoutes.js
      await API.put(`/churches/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Church updated successfully");
      navigate("/admin/churches");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to update church");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <p style={{ padding: "30px" }}>Loading church...</p>;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "30px" }}>
      <div
        style={{
          maxWidth: "700px",
          margin: "auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,.1)",
        }}
      >
        <h2>Update Church</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            type="text"
            name="churchName"
            placeholder="Church name"
            value={church.churchName}
            onChange={handleChange}
            required
          />

          <textarea
            name="shortDescription"
            placeholder="Short description (used on the campus card)"
            value={church.shortDescription}
            onChange={handleChange}
            rows="2"
            required
          />

          <textarea
            name="description"
            placeholder="Full description"
            value={church.description}
            onChange={handleChange}
            rows="6"
            required
          />

          <textarea
            name="history"
            placeholder="History"
            value={church.history}
            onChange={handleChange}
            rows="4"
          />

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={church.address}
            onChange={handleChange}
            required
          />

          <div style={{ display: "flex", gap: "15px" }}>
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={church.phone}
              onChange={handleChange}
              style={{ flex: 1 }}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={church.email}
              onChange={handleChange}
              style={{ flex: 1 }}
            />
          </div>

          <div style={{ display: "flex", gap: "15px" }}>
            <input
              type="text"
              name="serviceDays"
              placeholder="Service days (e.g. Sundays)"
              value={church.serviceDays}
              onChange={handleChange}
              required
              style={{ flex: 1 }}
            />
            <input
              type="text"
              name="serviceTime"
              placeholder="Service time (e.g. 9:00 AM)"
              value={church.serviceTime}
              onChange={handleChange}
              required
              style={{ flex: 1 }}
            />
          </div>

          {existingImage && !preview && (
            <div>
              <small style={{ color: "#64748b" }}>Current image:</small>
              <img
                src={existingImage}
                alt="current"
                style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px" }}
              />
            </div>
          )}

          <input type="file" accept="image/*" onChange={handleFileChange} />

          {preview && (
            <div>
              <small style={{ color: "#64748b" }}>New image:</small>
              <img
                src={preview}
                alt="preview"
                style={{ width: "100%", height: "250px", objectFit: "cover", borderRadius: "10px" }}
              />
            </div>
          )}

          <label>
            <input type="checkbox" name="isFeatured" checked={church.isFeatured} onChange={handleChange} />
            Featured
          </label>

          <label style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <input
              type="checkbox"
              name="isPrimary"
              checked={church.isPrimary}
              onChange={handleChange}
              style={{ marginTop: "3px" }}
            />
            <span>
              Set as Main Church
              <br />
              <small style={{ color: "#64748b" }}>
                Shown in the hero section of the public Church page. Only one
                church can hold this — checking it will replace whichever
                church currently holds it.
              </small>
            </span>
          </label>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "14px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/churches")}
              style={{
                padding: "14px",
                background: "#e2e8f0",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateChurch;