import React, { useState } from "react";
import API from "../../api/api";

const CreateLanguage = () => {

  const [language, setLanguage] = useState({
    name: "",
    code: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setLanguage({

      ...language,

      [name]: value

    });

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      setError("");

      const token =
        localStorage.getItem("token");

      await API.post(

        "/languages",

        {

          name: language.name,

          code: language.code.toUpperCase(),

        },

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      );

      alert("Language created successfully");

      setLanguage({

        name: "",

        code: "",

      });

    }

    catch (err) {

      console.log(err);

      setError(

        err.response?.data?.message ||

        "Failed to create language"

      );

    }

    finally {

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

          maxWidth: "600px",

          margin: "auto",

          background: "#fff",

          padding: "30px",

          borderRadius: "15px",

          boxShadow: "0 10px 30px rgba(0,0,0,.1)"

        }}

      >

        <h2>

          Create Language

        </h2>

        {

          error &&

          <p style={{ color: "red" }}>

            {error}

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

            type="text"

            name="name"

            placeholder="Language Name"

            value={language.name}

            onChange={handleChange}

            required

          />

          <input

            type="text"

            name="code"

            placeholder="Language Code (EN, AM, IT)"

            value={language.code}

            onChange={handleChange}

            required

            style={{

              textTransform: "uppercase"

            }}

          />

          <button

            type="submit"

            disabled={loading}

            style={{

              padding: "14px",

              background: "#2563eb",

              color: "white",

              border: "none",

              borderRadius: "10px",

              cursor: "pointer"

            }}

          >

            {

              loading

                ?

                "Creating..."

                :

                "Create Language"

            }

          </button>

        </form>

        <div

          style={{

            marginTop: "30px",

            padding: "15px",

            background: "#f8fafc",

            borderRadius: "10px"

          }}

        >

          <h4>Example Languages</h4>

          <table

            style={{

              width: "100%",

              borderCollapse: "collapse"

            }}

          >

            <thead>

              <tr>

                <th style={{ border: "1px solid #ddd", padding: "8px" }}>

                  Name

                </th>

                <th style={{ border: "1px solid #ddd", padding: "8px" }}>

                  Code

                </th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td style={{ border: "1px solid #ddd", padding: "8px" }}>

                  English

                </td>

                <td style={{ border: "1px solid #ddd", padding: "8px" }}>

                  EN

                </td>

              </tr>

              <tr>

                <td style={{ border: "1px solid #ddd", padding: "8px" }}>

                  Amharic

                </td>

                <td style={{ border: "1px solid #ddd", padding: "8px" }}>

                  AM

                </td>

              </tr>

              <tr>

                <td style={{ border: "1px solid #ddd", padding: "8px" }}>

                  Italian

                </td>

                <td style={{ border: "1px solid #ddd", padding: "8px" }}>

                  IT

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

};

export default CreateLanguage;
