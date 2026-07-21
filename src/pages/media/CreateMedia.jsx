import React, { useState } from "react";
import API from "../../api/api";


const CreateMedia = () => {


  const [media,setMedia] = useState({

    title:"",
    description:"",
    type:"photo",
    file:null

  });



  const [preview,setPreview] = useState(null);

  const [error,setError] = useState("");

  const [loading,setLoading] = useState(false);





  const handleChange=(e)=>{


    setMedia({

      ...media,

      [e.target.name]:e.target.value

    });


  };







  const handleFileChange=(e)=>{


    const file=e.target.files[0];


    setMedia({

      ...media,

      file:file

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
        media.title
      );



      formData.append(
        "description",
        media.description
      );



      formData.append(
        "type",
        media.type
      );



      if(media.file){

        formData.append(
          "file",
          media.file
        );

      }






      await API.post(

        "/media",

        formData,

        {

          headers:{

            Authorization:`Bearer ${token}`,

            "Content-Type":
            "multipart/form-data"

          }

        }

      );





      alert(
        "Media uploaded successfully"
      );





      setMedia({

        title:"",
        description:"",
        type:"photo",
        file:null

      });



      setPreview(null);



    }
    catch(err){


      console.log(err);


      setError(

        err.response?.data?.message ||

        "Failed to upload media"

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
Create Media
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

placeholder="Media title"

value={media.title}

onChange={handleChange}

required

/>







<textarea

name="description"

placeholder="Media description"

rows="5"

value={media.description}

onChange={handleChange}

/>







<select

name="type"

value={media.type}

onChange={handleChange}

>



<option value="photo">

Photo

</option>



<option value="video">

Video

</option>



<option value="audio">

Audio

</option>



</select>








<input

type="file"

accept="image/*,video/*,audio/*"

onChange={handleFileChange}

required

/>








{
preview && media.type==="photo" &&

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







{
preview && media.type==="video" &&

<video

src={preview}

controls

style={{

width:"100%"

}}

/>

}







{
preview && media.type==="audio" &&

<audio

src={preview}

controls

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
"Uploading..."
:
"Upload Media"
}


</button>





</form>


</div>


</div>


);


};


export default CreateMedia;
