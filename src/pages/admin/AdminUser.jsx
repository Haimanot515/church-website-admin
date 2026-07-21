import React, { useState, useEffect } from "react";
import API from "../../api/api";

const PAGE_SIZE = 20;

const AdminUsers = ({ mode }) => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [editUser, setEditUser] = useState({});
  const [editMode, setEditMode] = useState(false);

  const fetchUsersPage = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get(`/admin/users?page=${page}&limit=${PAGE_SIZE}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users);
      setTotalUsers(res.data.totalUsers);
      setCurrentPage(page);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/admin/users/?search=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.users.length > 0) {
        const user = res.data.users[0];
        setSearchResult(user);
        setEditUser({
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          phone: user.phone || "",
          address: user.address || "",
        });
        setEditMode(true);
      } else {
        alert("No user found");
      }
    } catch {
      setError("Search Failed");
    }
  };

  const handleUpdate = async () => {
    if (!searchResult) return;
    const token = localStorage.getItem("token");
    await API.put(`/admin/users/${searchResult._id}`, editUser, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("User updated successfully");
    setSearchQuery("");
    setSearchResult(null);
    setEditMode(false);
    fetchUsersPage(currentPage);
  };

  const handleDelete = async () => {
    if (!searchResult) return;
    if (!window.confirm("Are you sure?")) return;
    const token = localStorage.getItem("token");
    await API.delete(`/admin/delete/${searchResult._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("User deleted successfully");
    setSearchQuery("");
    setSearchResult(null);
    setEditMode(false);
    fetchUsersPage(currentPage);
  };

  useEffect(() => {
    fetchUsersPage(1);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "30px", fontFamily: "Segoe UI" }}>

      {/* ================= VIEW USERS ================= */}
      {mode === "/admin/users/view" && (
        <div style={{ background: "#fff", padding: "25px", borderRadius: "14px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
          <h1 style={{ textAlign: "center", color: "#1e293b" }}>Welcome to Users Data</h1>
          <h2 style={{ textAlign: "center", color: "#475569" }}>Total Users: {totalUsers}</h2>

          {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

          {loading ? (
            <p style={{ textAlign: "center" }}>Loading users...</p>
          ) : (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
                <thead>
                  <tr style={{ background: "#2563eb", color: "#fff" }}>
                    <th style={{ padding: "12px" }}>Name</th>
                    <th style={{ padding: "12px" }}>Email</th>
                    <th style={{ padding: "12px" }}>Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "10px" }}>{u.name}</td>
                      <td style={{ padding: "10px" }}>{u.email}</td>
                      <td style={{ padding: "10px", fontWeight: "bold", color: u.isAdmin ? "#16a34a" : "#1e40af" }}>
                        {u.isAdmin=="true"||u.isAdmin===true ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                <button
                  style={{ padding: "10px 18px", borderRadius: "10px", background: "#2563eb", color: "#fff", border: "none" }}
                  onClick={() => fetchUsersPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <button
                  style={{ padding: "10px 18px", borderRadius: "10px", background: "#2563eb", color: "#fff", border: "none" }}
                  onClick={() => fetchUsersPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= DELETE USERS ================= */}
      {mode === "/admin/users/delete" && (
        <div style={{ marginTop: "30px", background: "#fff", padding: "25px", borderRadius: "14px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", textAlign: "center" }}>
          <h3>Delete Users</h3>
          <input
            style={{ width: "500px", padding: "14px", borderRadius: "10px", border: "1px solid #cbd5f5" }}
            placeholder="Search user by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <br /><br />
          <button
            style={{ padding: "12px 20px", borderRadius: "10px", background: "#dc2626", color: "#fff", border: "none" }}
            onClick={handleSearch}
          >
            Search
          </button>

          {editMode && searchResult && (
            <>
              <h4>User Found: {searchResult.name}</h4>
              <button
                style={{ padding: "12px 20px", borderRadius: "10px", background: "#b91c1c", color: "#fff", border: "none" }}
                onClick={handleDelete}
              >
                Delete User
              </button>
            </>
          )}
        </div>
      )}

      {/* ================= UPDATE USERS ================= */}
      {mode === "/admin/users/update" && (
        <div style={{ marginTop: "30px", background: "#fff", padding: "25px", borderRadius: "14px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", textAlign: "center" }}>
          <h3>Update Users</h3>

          <input
            style={{ width: "500px", padding: "14px", borderRadius: "10px", border: "1px solid #cbd5f5" }}
            placeholder="Search user by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <br /><br />
          <button
            style={{ padding: "12px 20px", borderRadius: "10px", background: "#16a34a", color: "#fff", border: "none" }}
            onClick={handleSearch}
          >
            Search
          </button>

          {editUser && searchResult && (
            <div style={{display:"flex",marginTop: "20px", padding: "20px", background: "#f8fafc", borderRadius: "12px" }}>
              <h4>User Found: {searchResult.name}</h4>

              <input value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} placeholder="Name" style={{ padding: "10px", margin: "5px" }} />
              <input value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} placeholder="Email" style={{ padding: "10px", margin: "5px" }} />

              <select value={String(editUser.isAdmin)} onChange={(e) => setEditUser({ ...editUser, isAdmin: e.target.value })} style={{ padding: "10px", margin: "5px" }}>
                <option value="true">Admin</option>
                <option value="false">User</option>
              </select>

              <input value={editUser.phone} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })} placeholder="Phone" style={{ padding: "10px", margin: "5px" }} />
              <input value={editUser.address} onChange={(e) => setEditUser({ ...editUser, address: e.target.value })} placeholder="Address" style={{ padding: "10px", margin: "5px" }} />

              <br />
              <button
                style={{ marginTop: "10px", padding: "12px 20px", borderRadius: "10px", background: "#2563eb", color: "#fff", border: "none" }}
                onClick={handleUpdate}
              >
                Update User
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
