import React, { useState, useEffect } from "react";
import API from "../../api/api";


const GetSubscribers = () => {

  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingEmail, setRemovingEmail] = useState(null);


  const fetchSubscribers = async () => {

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      // Matches GET /api/subscribers -> getAllSubscribers
      const res = await API.get("/subscribers", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSubscribers(res.data);

    } catch (err) {

      console.log(err);

      setError(
        err.response?.data?.msg ||
        "Failed to load subscribers"
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {
    fetchSubscribers();
  }, []);


  const handleUnsubscribe = async (id, email) => {

    const confirmed = window.confirm(
      `Unsubscribe "${email}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {

      setRemovingEmail(email);

      // Matches GET /api/subscribers/unsubscribe -> unsubscribe
      await API.get("/subscribers/unsubscribe", {
        params: { email }
      });

      setSubscribers((prev) =>
        prev.filter((s) => s._id !== id)
      );

    } catch (err) {

      console.log(err);

      alert(
        err.response?.data?.msg ||
        "Failed to unsubscribe"
      );

    } finally {

      setRemovingEmail(null);

    }

  };


  if (loading) return <p style={{ padding: "30px" }}>Loading subscribers...</p>;


  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "30px"
      }}
    >

      <div
        style={{
          maxWidth: "900px",
          margin: "auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,.1)"
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}
        >

          <h2 style={{ margin: 0 }}>Subscribers</h2>

          <span style={{ color: "#64748b", fontSize: "14px" }}>
            {subscribers.length} active
          </span>

        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {subscribers.length === 0 && !error && <p>No subscribers yet.</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

          {subscribers.map((s) => (

            <div
              key={s._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "14px 16px"
              }}
            >

              <div>

                <strong>{s.email}</strong>

                <div
                  style={{
                    color: "#64748b",
                    fontSize: "13px"
                  }}
                >
                  Subscribed {new Date(s.subscribedAt).toLocaleDateString()}
                </div>

              </div>

              <button
                onClick={() => handleUnsubscribe(s._id, s.email)}
                disabled={removingEmail === s.email}
                style={{
                  padding: "8px 14px",
                  background: "#fee2e2",
                  color: "#b91c1c",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                {removingEmail === s.email ? "Removing..." : "Unsubscribe"}
              </button>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

};


export default GetSubscribers;