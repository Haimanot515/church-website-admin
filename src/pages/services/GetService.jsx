import React, { useEffect, useState } from "react";
import API from "../../api/api";

const ManageServices = () => {

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await API.get("/services");
      setServices(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;

    try {
      await API.delete(`/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(services.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete service");
    }
  };

  const handleToggleStatus = async (service) => {
    const newStatus = service.status === "active" ? "inactive" : "active";

    try {
      const res = await API.put(
        `/services/${service._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setServices(
        services.map((s) => (s._id === service._id ? res.data : s))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleEdit = (id) => {
    window.location.href = `/admin/services/update/${id}`;
  };

  if (loading) return <p>Loading services...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "auto" }}>

      <h2>Manage Services</h2>

      {services.length === 0 ? (
        <p>No services found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>

          {services.map((service) => (
            <div
              key={service._id}
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "10px",
                padding: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >

              <div>
                <h3 style={{ margin: "0 0 4px" }}>{service.title}</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
                  {service.schedule} · {service.category} ·{" "}
                  <strong style={{ color: service.status === "active" ? "green" : "gray" }}>
                    {service.status}
                  </strong>
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>

                <button
                  onClick={() => handleEdit(service._id)}
                  style={{
                    padding: "8px 14px",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => handleToggleStatus(service)}
                  style={{
                    padding: "8px 14px",
                    background: service.status === "active" ? "#f59e0b" : "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  {service.status === "active" ? "Make inactive" : "Make active"}
                </button>

                <button
                  onClick={() => handleDelete(service._id)}
                  style={{
                    padding: "8px 14px",
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Delete
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default ManageServices;