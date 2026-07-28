import React, { useState } from "react";
import API from "../../api/api";


const CreateSubscriber = () => {

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {

    setEmail(e.target.value);

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);
      setError("");
      setSuccess("");

      // Matches POST /api/subscribers -> subscribe
      const res = await API.post(
        "/subscribers",
        { email }
      );

      setSuccess(
        res.data?.msg ||
        "Subscribed successfully"
      );

      setEmail("");

    } catch (error) {

      console.log(error);

      setError(
        error.response?.data?.msg ||
        "Failed to add subscriber"
      );

    } finally {

      setLoading(false);

    }

  };


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
          maxWidth: "650px",
          margin: "auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,.1)"
        }}
      >

        <h2>
          Add Subscriber
        </h2>

        {
          error &&

          <p style={{ color: "red" }}>
            {error}
          </p>

        }

        {
          success &&

          <p style={{ color: "#16a34a" }}>
            {success}
          </p>

        }

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px"
          }}
        >

          <input

            type="email"

            name="email"

            placeholder="subscriber@example.com"

            value={email}

            onChange={handleChange}

            required

          />

          <button

            type="submit"

            disabled={loading}

            style={{

              padding: "14px",

              background: "#16a34a",

              color: "#fff",

              border: "none",

              borderRadius: "10px",

              cursor: "pointer"

            }}

          >

            {
              loading
              ? "Adding..."
              : "Add Subscriber"
            }

          </button>

        </form>

      </div>

    </div>

  );

};


export default CreateSubscriber;