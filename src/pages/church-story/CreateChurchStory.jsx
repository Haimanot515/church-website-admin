import React, { useState, useEffect } from "react";
import API from "../../api/api";


const CreateChurchStory = () => {


  const [story,setStory] = useState({

    title:"",
    desc:"",
    leader:"",
    leaderRole:"",
    range:"",
    servedBy:"",
    order:0,
    year:"",
    language:"",
    file:null

  });


  const [languages,setLanguages] = useState([]);

  const [preview,setPreview] = useState(null);

  const [error,setError] = useState("");

  const [loading,setLoading] = useState(false);


  // Fetch available languages so the chapter can be tied to one
  useEffect(() => {

    const fetchLanguages = async () => {

      try{

        const res = await API.get("/languages");

        setLanguages(res.data || []);

        if(res.data?.length){

          setStory((prev) => ({ ...prev, language: prev.language || res.data[0]._id }));

        }

      }
      catch(err){

        console.log(err);

      }

    };

    fetchLanguages();

  }, []);



  // Revoke the previous preview URL whenever it changes or the component unmounts
  useEffect(() => {

    return () => {

      if(preview) URL.revokeObjectURL(preview);

    };

  }, [preview]);





  const handleChange=(e)=>{


    setStory({

      ...story,

      [e.target.name]:e.target.value

    });


  };







  const handleFileChange=(e)=>{


    const selectedFile=e.target.files[0];


    setStory({

      ...story,

      file:selectedFile || null

    });



    if(selectedFile){

      setPreview(
        URL.createObjectURL(selectedFile)
      );

    } else {

      setPreview(null);

    }


  };








  const handleSubmit=async(e)=>{


    e.preventDefault();

    setError("");


    if(!story.language){

      setError("Please select a language");

      return;

    }


    try{


      setLoading(true);



      const formData=new FormData();



      formData.append(
        "title",
        story.title
      );



      formData.append(
        "desc",
        story.desc
      );



      formData.append(
        "leader",
        story.leader
      );



      formData.append(
        "leaderRole",
        story.leaderRole
      );



      formData.append(
        "range",
        story.range
      );



      formData.append(
        "servedBy",
        story.servedBy
      );



      formData.append(
        "order",
        story.order
      );



      formData.append(
        "language",
        story.language
      );



      // Only append year if a value was actually entered — sending an empty
      // string can fail schema validation if year is typed as a Number.
      if(story.year){

        formData.append(
          "year",
          story.year
        );

      }



      if(story.file){

        formData.append(
          "photo",
          story.file
        );

      }



      // Auth header is already attached globally by the API interceptor
      await API.post(

        "/church-story",

        formData,

        {

          headers:{

            "Content-Type":
            "multipart/form-data"

          }

        }

      );





      alert(
        "Church story chapter created successfully"
      );





      setStory({

        title:"",
        desc:"",
        leader:"",
        leaderRole:"",
        range:"",
        servedBy:"",
        order:0,
        year:"",
        language:languages[0]?._id || "",
        file:null

      });



      setPreview(null);



    }
    catch(err){


      console.log(err);


      setError(

        err.response?.data?.message ||

        "Failed to create church story chapter"

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

maxWidth:"650px",

margin:"auto",

background:"#fff",

padding:"30px",

borderRadius:"15px",

boxShadow:"0 10px 30px rgba(0,0,0,.1)"

}}

>


<h2>
Create Church Story Chapter
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



<select

name="language"

value={story.language}

onChange={handleChange}

required

>

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

name="title"

placeholder="Chapter title (e.g. The Founding Years)"

value={story.title}

onChange={handleChange}

required

/>







<input

type="text"

name="leader"

placeholder="Leader name"

value={story.leader}

onChange={handleChange}

/>







<input

type="text"

name="leaderRole"

placeholder="Leader role (e.g. Founding Pastor)"

value={story.leaderRole}

onChange={handleChange}

/>







<input

type="text"

name="range"

placeholder="Years led (e.g. 1998 – 2006)"

value={story.range}

onChange={handleChange}

/>







<input

type="text"

name="servedBy"

placeholder="Served by / community group"

value={story.servedBy}

onChange={handleChange}

/>







<input

type="number"

name="order"

placeholder="Display order (lower = shown first)"

value={story.order}

onChange={handleChange}

min="0"

/>







<input

type="number"

name="year"

placeholder="Sort year (used for chronological ordering)"

value={story.year}

onChange={handleChange}

/>







<textarea

name="desc"

placeholder="Chapter description"

rows="5"

value={story.desc}

onChange={handleChange}

/>







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

width:"160px",

height:"160px",

objectFit:"cover",

borderRadius:"10px",

border:"1px solid #e2e8f0"

}}

/>

}







<button

type="submit"

disabled={loading}

style={{

padding:"14px",

background:"#2563eb",

color:"#fff",

border:"none",

borderRadius:"10px",

cursor:"pointer"

}}

>


{
loading
?
"Saving..."
:
"Create Story Chapter"
}


</button>





</form>


</div>


</div>


);


};


export default CreateChurchStory;