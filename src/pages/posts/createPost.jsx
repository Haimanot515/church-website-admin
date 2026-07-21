import React, { useState } from "react";
import API from "../../api/api";

const CreatePost = () => {

  const [post, setPost] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
    language: "",
    isTrending: false,
    isFeatured: false,
    isRecommended: false,
    status: "draft",
    image: null,
  });


  const categories = [
    { _id: "1", name: "Sermons" },
    { _id: "2", name: "Events" },
    { _id: "3", name: "Ministries" },
    { _id: "4", name: "Testimonies" },
    { _id: "5", name: "Missions" },
    { _id: "6", name: "Youth" },
    { _id: "7", name: "Bible Study" },
    { _id: "8", name: "Music" },
    { _id: "9", name: "Outreach" },
  ];


  const languages = [
    { _id: "1", name: "English" },
    { _id: "2", name: "Amharic" },
    { _id: "3", name: "Italian" },
  ];



  const [preview,setPreview] = useState(null);
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);



  const handleChange = (e)=>{

    const {name,value,type,checked}=e.target;


    setPost({

      ...post,

      [name]:
      type === "checkbox"
      ? checked
      : value

    });

  };




  const handleFileChange=(e)=>{

    const file=e.target.files[0];


    setPost({

      ...post,

      image:file

    });


    if(file){

      setPreview(
        URL.createObjectURL(file)
      );

    }

  };





  const handleSubmit=async(e)=>{

    e.preventDefault();


    try{

      setLoading(true);


      const token =
      localStorage.getItem("token");



      const formData=new FormData();


      formData.append(
        "title",
        post.title
      );


      formData.append(
        "description",
        post.description
      );


      formData.append(
        "content",
        post.content
      );


      formData.append(
        "category",
        post.category
      );


      formData.append(
        "language",
        post.language
      );


      formData.append(
        "isTrending",
        post.isTrending
      );


      formData.append(
        "isFeatured",
        post.isFeatured
      );


      formData.append(
        "isRecommended",
        post.isRecommended
      );


      formData.append(
        "status",
        post.status
      );



      if(post.image){

        formData.append(
          "image",
          post.image
        );

      }





      await API.post(
        "/posts",
        formData,
        {
          headers:{
            Authorization:`Bearer ${token}`,
            "Content-Type":"multipart/form-data"
          }
        }
      );



      alert(
        "Post created successfully"
      );



      setPost({

        title:"",
        description:"",
        content:"",
        category:"",
        language:"",
        isTrending:false,
        isFeatured:false,
        isRecommended:false,
        status:"draft",
        image:null,

      });


      setPreview(null);


    }
    catch(err){

      console.log(err);

      setError(
        err.response?.data?.message ||
        "Failed to create post"
      );

    }
    finally{

      setLoading(false);

    }

  };





return (

<div
style={{
minHeight:"100vh",
background:"#f1f5f9",
padding:"30px"
}}
>


<div
style={{
maxWidth:"700px",
margin:"auto",
background:"#fff",
padding:"30px",
borderRadius:"15px",
boxShadow:"0 10px 30px rgba(0,0,0,.1)"
}}
>


<h2>
Create Post
</h2>



{
error &&
<p style={{color:"red"}}>
{error}
</p>
}





<form
onSubmit={handleSubmit}
style={{
display:"flex",
flexDirection:"column",
gap:"15px"
}}
>


<input
type="text"
name="title"
placeholder="Post title"
value={post.title}
onChange={handleChange}
required
/>





<textarea
name="description"
placeholder="Post description"
value={post.description}
onChange={handleChange}
rows="3"
required
/>





<textarea
name="content"
placeholder="Post content"
value={post.content}
onChange={handleChange}
rows="8"
required
/>







<select
name="category"
value={post.category}
onChange={handleChange}
required
>

<option value="">
Select Category
</option>


{
categories.map(cat=>(

<option
key={cat._id}
value={cat._id}
>

{cat.name}

</option>

))
}


</select>








<select
name="language"
value={post.language}
onChange={handleChange}
required
>


<option value="">
Select Language
</option>



{
languages.map(lang=>(

<option
key={lang._id}
value={lang._id}
>

{lang.name}

</option>

))
}


</select>







<input
type="file"
accept="image/*"
onChange={handleFileChange}
/>





{
preview &&

<img
src={preview}
alt="preview"
style={{
width:"100%",
height:"250px",
objectFit:"cover",
borderRadius:"10px"
}}
/>

}





<select
name="status"
value={post.status}
onChange={handleChange}
>


<option value="draft">
Draft
</option>


<option value="published">
Published
</option>


</select>







<label>

<input
type="checkbox"
name="isTrending"
checked={post.isTrending}
onChange={handleChange}
/>

Trending

</label>





<label>

<input
type="checkbox"
name="isFeatured"
checked={post.isFeatured}
onChange={handleChange}
/>

Featured

</label>





<label>

<input
type="checkbox"
name="isRecommended"
checked={post.isRecommended}
onChange={handleChange}
/>

Recommended

</label>






<button
type="submit"
disabled={loading}
style={{
padding:"14px",
background:"#2563eb",
color:"white",
border:"none",
borderRadius:"10px",
cursor:"pointer"
}}
>

{
loading
?
"Creating..."
:
"Create Post"
}


</button>



</form>


</div>


</div>


);


};


export default CreatePost;