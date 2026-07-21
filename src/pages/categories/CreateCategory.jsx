import React, { useState } from "react";
import API from "../../api/api";

const CreateCategory = () => {

  const [category, setCategory] = useState({
    name: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setCategory({

      ...category,

      [name]: value,

    });

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      setError("");

      // Auth header is already attached globally by the API interceptor
      await API.post(

        "/categories",

        {

          name: category.name,

          description: category.description,

        }

      );

      alert("Category created successfully");

      setCategory({

        name: "",

        description: "",

      });

    }

    catch (err) {

      console.log(err);

      setError(

        err.response?.data?.message ||

        "Failed to create category"

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

        padding: "30px",

      }}

    >

      <div

        style={{

          maxWidth: "650px",

          margin: "auto",

          background: "#fff",

          padding: "30px",

          borderRadius: "15px",

          boxShadow: "0 10px 30px rgba(0,0,0,.1)",

        }}

      >

        <h2>Create Category</h2>

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

            gap: "15px",

          }}

        >

          <input

            type="text"

            name="name"

            placeholder="Category Name"

            value={category.name}

            onChange={handleChange}

            required

          />



          <textarea

            name="description"

            placeholder="Category Description"

            value={category.description}

            onChange={handleChange}

            rows="5"

          />



          <button

            type="submit"

            disabled={loading}

            style={{

              padding: "14px",

              background: "#2563eb",

              color: "#fff",

              border: "none",

              borderRadius: "10px",

              cursor: "pointer",

            }}

          >

            {

              loading

                ?

                "Creating..."

                :

                "Create Category"

            }

          </button>

        </form>



        <div

          style={{

            marginTop: "30px",

            padding: "15px",

            background: "#f8fafc",

            borderRadius: "10px",

          }}

        >

          <h4>Example Categories</h4>

          <table

            style={{

              width: "100%",

              borderCollapse: "collapse",

            }}

          >

            <thead>

              <tr>

                <th style={{ border: "1px solid #ddd", padding: "8px" }}>

                  Category

                </th>

                <th style={{ border: "1px solid #ddd", padding: "8px" }}>

                  Description

                </th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td style={{ border: "1px solid #ddd", padding: "8px" }}>

                  Sermons

                </td>

                <td style={{ border: "1px solid #ddd", padding: "8px" }}>

                  Weekly church sermons and teachings.

                </td>

              </tr>

              <tr>

                <td style={{ border: "1px solid #ddd", padding: "8px" }}>

                  Events

                </td>

                <td style={{ border: "1px solid #ddd", padding: "8px" }}>

                  Church events and upcoming programs.

                </td>

              </tr>

              <tr>

                <td style={{ border: "1px solid #ddd", padding: "8px" }}>

                  Testimonies

                </td>

                <td style={{ border: "1px solid #ddd", padding: "8px" }}>

                  Inspiring testimonies from believers.

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

};

export default CreateCategory;