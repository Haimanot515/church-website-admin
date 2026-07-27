import React, { useState, useEffect } from "react";
import API from "../../api/api";

const CreateChurchAssignment = () => {
  const [assignment, setAssignment] = useState({
    user: "",
    church: "",
    role: "",
    servingSince: "",
    description: "",
  });

  const [users, setUsers] = useState([]);
  const [churches, setChurches] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch users and churches from the backend on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = localStorage.getItem("token");

        const [userRes, churchRes] = await Promise.all([
          API.get("/admin/users?page=1&limit=1000", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          API.get("/churches"),
        ]);

        setUsers(userRes.data.users); // /admin/users returns { users, totalUsers }
        setChurches(churchRes.data);
      } catch (err) {
        console.log(err);
        setError("Failed to load users or churches");
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAssignment({
      ...assignment,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // Matches POST /api/churches/assignment in churchRoutes.js,
      // handled by createAssignment in churchController.js
      await API.post(
        "/churches/assignment",
        {
          user: assignment.user,
          church: assignment.church,
          role: assignment.role,
          servingSince: assignment.servingSince || undefined,
          description: assignment.description,
          isCurrent: true,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Church assignment saved successfully");

      setAssignment({
        user: "",
        church: "",
        role: "",
        servingSince: "",
        description: "",
      });
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to save church assignment");
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
        <h2>Assign Church</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <select
            name="user"
            value={assignment.user}
            onChange={handleChange}
            required
            disabled={optionsLoading}
          >
            <option value="">
              {optionsLoading ? "Loading users..." : "Select User"}
            </option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name || u.username || u.email}
              </option>
            ))}
          </select>

          <select
            name="church"
            value={assignment.church}
            onChange={handleChange}
            required
            disabled={optionsLoading}
          >
            <option value="">
              {optionsLoading ? "Loading churches..." : "Select Church"}
            </option>
            {churches.map((c) => (
              <option key={c._id} value={c._id}>
                {c.churchName}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="role"
            placeholder="Role (e.g. Pastor, Worship Leader, Member)"
            value={assignment.role}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="servingSince"
            placeholder="Serving since"
            value={assignment.servingSince}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Description shown on the 'Where I Serve Now' card"
            value={assignment.description}
            onChange={handleChange}
            rows="4"
          />

          <button
            type="submit"
            disabled={loading || optionsLoading}
            style={{
              padding: "14px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            {loading ? "Saving..." : "Save Assignment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateChurchAssignment;