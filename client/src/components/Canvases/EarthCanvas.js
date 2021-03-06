import React, { useRef, useState, useEffect } from 'react'
import {Link} from 'react-router-dom'
import Background from './earth.jpg';
import ReactAudioPlayer from 'react-audio-player';
import soundy from "../../sounds/earth.mp3"

import './canvas.css'

const colors = [
  {
    ref: "#6D786B"
  },
  {
    ref: "#A3A78F"
  },
  {
    ref: "#B7BCBB"
  },
  {
    ref: "#7D615A"
  },
  {
    ref: "#AD958D"
  },
  {
    ref: "#C6AD8F"
  }
]

const lineWidth = [
  {
    name: "select brush size",
    value: 3
  },
  {
    name: "x-small",
    value: 1
  },
  {
    name: "small",
    value: 3
  },
  {
    name: "medium",
    value: 7
  },
  {
    name: "large",
    value: 10
  },
  {
    name: "x-large",
    value: 15
  }
]

function EarthCanvas() {

  const [inputs, setInputs] = useState({
    artwork_name: "",
  })

  const {artwork_name} = inputs;

  const onChange = (e) => {
    setInputs({...inputs, [e.target.name] : e.target.value})
  }

  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const [selectedSize, setSelectedSize] = useState(lineWidth[0]);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = 600 * 2
    canvas.height = 600 * 2
    canvas.style.width = '600px'
    canvas.style.height = '600px'
    // canvas.style.border = "2px solid #000";

    const context = canvas.getContext('2d')
    context.scale(2, 2)
    context.lineCap = "round"
    context.strokeStyle = selectedColor;
    context.lineWidth = selectedSize;
    contextRef.current = context;
    context.fillStyle = "white"
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const download = async () => {
    const image = canvasRef.current.toDataURL('image/png');
    const blob = await (await fetch(image)).blob();
    const blobURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobURL;
    link.download = "image.png";
    console.log("link download", link.href)
    link.click();
  }

  const clear = () => {
    contextRef.current.clearRect(0, 0, contextRef.current.canvas.width, contextRef.current.canvas.height)
    contextRef.current.fillRect(0, 0, contextRef.current.canvas.width, contextRef.current.canvas.height)
  }

  const startDrawing = ({nativeEvent}) => {
    const {offsetX, offsetY} = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true)
  }

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false)
  }

  const draw = ({nativeEvent}) => {
    if(!isDrawing) {
      return
    }
    const {offsetX, offsetY} = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY)
    contextRef.current.strokeStyle = selectedColor;
    contextRef.current.lineWidth = selectedSize;
    contextRef.current.stroke();
  }

  const onSubmitForm = async(e) => {
    e.preventDefault()

    try {
      const file_data = canvasRef.current.toDataURL('image/png');

      const imageData = await (await fetch(file_data)).blob();
      const blobURL = URL.createObjectURL(imageData);
    

    const users_id = JSON.parse(localStorage.getItem('users_id').toString())
    console.log("file data", file_data)
    console.log("bloburl", blobURL)
    console.log("user id", users_id)

    
    const body = {artwork_name, file_data, users_id}

      const response = await fetch("http://localhost:5000/gallery", {
        method: "POST",
        headers: {"Content-Type": "application/json"}
        ,
        body: JSON.stringify(body)
      });

      const parseRes = await response.json();
      console.log("gallery parseres", parseRes)


    } catch (err) {
      console.error(err.message)
    }
  }

  return (
    <div  className="container-painting" style={{background: `url(${Background})`, backgroundSize: "100%", height: "900px"}}>
      <div className="painting">
        <canvas className="canvas"
         onMouseDown={startDrawing}
         onMouseUp={finishDrawing}
         onMouseMove={draw}
         ref={canvasRef}
        />
      </div> 

      <div className="buttons-painting"> 
        <div className="palette-container" style={{backgroundColor:"#EDECE8"}}>
          <div className="palette-div" >
          {
            colors.map(
              color => <button 
                className="btn-palette" 
                onClick={(e) => setSelectedColor(e.target.value)} 
                value={color.ref}
                style={{backgroundColor:`${color.ref}`}}
                >

                </button>
              )
          }
          </div>
        <div className="palette-options">
          <select
            className="btn-paint"
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            >
            {
              lineWidth.map(
                size => <option key={size.name} value={size.value}>{size.name}</option>
                )
              }        
          </select>
              <br></br>
          <div>
            <button className="btn-paint" onClick={clear}>Clear</button>
            &nbsp;
            &nbsp;
            <button className="btn-paint" onClick={download}>Download</button>
          </div>
        </div>
      </div>  
        <ReactAudioPlayer
          src={soundy}
          autoPlay={true}
          controls={true}
          onPlay={e => console.log("onPlay")}
        />
        </div>

      <div>
    </div>
  </div>
     )    
    }
    export default EarthCanvas;
