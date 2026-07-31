import React, { useState, useEffect } from "react";
import API from "../../api/api";

const CreateChurch = () => {
  const [church, setChurch] = useState({
    churchName: "",
    shortDescription: "",
    description: "",
    address: "",
    serviceDays: "",
    serviceTime: "",
    language: "",
    isFeatured: false,
    isPrimary: false,
    image: null,
  });

  const [languages, setLanguages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch available languages so the entry can be tied to one
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await API.get("/languages");
        setLanguages(res.data || []);
        if (res.data?.length) {
          setChurch((prev) => ({ ...prev, language: prev.language || res.data[0]._id }));
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchLanguages();
  }, []);

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

    if (!church.language) {
      setError("Please select a language");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("churchName", church.churchName);
      formData.append("shortDescription", church.shortDescription);
      formData.append("description", church.description);
      formData.append("address", church.address);
      formData.append("serviceDays", church.serviceDays);
      formData.append("serviceTime", church.serviceTime);
      formData.append("language", church.language);
      formData.append("isFeatured", church.isFeatured);
      formData.append("isPrimary", church.isPrimary);

      if (church.image) {
        formData.append("image", church.image);
      }

      // Auth header is already attached globally by the API interceptor
      await API.post("/churches", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Church created successfully");

      setChurch({
        churchName: "",
        shortDescription: "",
        description: "",
        address: "",
        serviceDays: "",
        serviceTime: "",
        language: languages[0]?._id || "",
        isFeatured: false,
        isPrimary: false,
        image: null,
      });

      setPreview(null);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to create church");
    } finally {
      setLoading(false);
    }
  };

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
        <h2>Create Church</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <select name="language" value={church.language} onChange={handleChange} required>
            <option value="" disabled>
              Select language
            </option>
            {languages.map((lang) => (
              <option key={lang._id} value={lang._id}>
                {lang.name} ({lang.code})
              </option>
            ))}
          </select>

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

          <input type="file" accept="image/*" onChange={handleFileChange} />

          {preview && (
            <img
              src={preview}
              alt="preview"
              style={{ width: "100%", height: "250px", objectFit: "cover", borderRadius: "10px" }}
            />
          )}

          <label>
            <input type="checkbox" name="isFeatured" checked={church.isFeatured} onChange={handleChange} />
            Featured
          </label>

          {/* UI-facing label reads "Main Church" — maps internally to isPrimary,
              which drives the public hero section on the Church page. */}
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
                Shown in the hero section of the public Church page, for this
                language. Only one church per language can hold this —
                selecting it will replace whichever church currently holds it
                for the selected language.
              </small>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            {loading ? "Creating..." : "Create Church"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateChurch;