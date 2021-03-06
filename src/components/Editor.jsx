import React, { useEffect, useRef, useState } from 'react'
import {storage} from "../firebase"
import firebase from 'firebase'


function Editor() {
    const [cw, setcw] = useState(1250)
    const [ch, setch] = useState(500)
    const [lineWidth, setLineWidth] = useState(3)
    const [atag, setAtag] = useState("")
    const [clickable, setClickable] = useState(false)
    const [isS, setIsS] = useState(false)
    const [isShapes, setIsShapes] = useState(false)
    const [lineCap, setLineCap] = useState("round")

    const [write, setWrite] = useState(false)
    const [message, setMessage] = useState("")
    const [shape, setShape] = useState("fillRect")
    

    const canvasRef = useRef(null);
    const [c, setc] = useState(null);
    const [color, setColor] = useState("#000000")
    const [sec, setSec] = useState("#000000")

    if(cw > 1300){
      setcw(1300)
    }
    if(ch > 500){
      setch(500)
    }
  
    useEffect(() => {
      let mouseDown = false;
      let start = { x: 0, y: 0 };
      let end = { x: 0, y: 0 };
      let second = { x: 0, y: 0 };
      let first = { x: 0, y: 0 };
      
      let canvasOffsetLeft = 0;
      let canvasOffsetTop = 0;
  
      function handleMouseDown(evt) {
        mouseDown = true;
  
        start = {
          x: evt.clientX - canvasOffsetLeft,
          y: evt.clientY - canvasOffsetTop,
        };
  
        end = {
          x: evt.clientX - canvasOffsetLeft,
          y: evt.clientY - canvasOffsetTop,
        };

        if(isShapes){
          c.fillStyle = color
          c.strokeStyle = sec

          if(shape === "fillRect"){    
            c.fillRect(start.x-lineWidth*2,start.y-lineWidth*2,lineWidth*4, lineWidth*4)
            if(isS){
              c.strokeRect(start.x-lineWidth*2,start.y-lineWidth*2,lineWidth*4, lineWidth*4)
            }
          }else if(shape === "arc"){
            if(isS){
              c.beginPath()
              c.arc(start.x,start.y,lineWidth*2,0,2*Math.PI)
              c.stroke()
            }
            c.arc(start.x,start.y,lineWidth*2,0,2*Math.PI)
            c.closePath()
            c.fill()

          }else if(shape === "lineTo"){
            c.beginPath()
            c.lineCap = lineCap;
            c.moveTo(start.x, start.y);
            if(second.x){
              if(isS){
                c.lineWidth = lineWidth*2;
                c.strokeStyle = sec
                c.lineTo(second.x, second.y)
                c.stroke()
              }
              c.lineWidth = lineWidth
              c.strokeStyle = color
              c.lineTo(second.x, second.y)
            }else{
              first = start
            }
            
            c.strokeStyle = color;
            c.lineWidth = lineWidth;
            c.stroke();
            c.closePath();
 
            second = start
          }
          return
        }

        if(write){
          c.fillStyle = color
          c.strokeStyle = sec
          c.font = `${lineWidth/2}rem Arial`;

          if(isS){
            c.strokeText(message,start.x,start.y);
          }
          c.fillText(message,start.x,start.y);
        }
      }
  
      function handleMouseUp(evt) {
        mouseDown = false;
      }
  
      function handleMouseMove(evt) {
        if (mouseDown && c && !write && !isShapes) {
          start = {
            x: end.x,
            y: end.y,
          };
  
          end = {
            x: evt.clientX - canvasOffsetLeft,
            y: evt.clientY - canvasOffsetTop,
          };


          if(isS){
            c.beginPath();
            c.moveTo(start.x, start.y);
            c.lineTo(end.x, end.y);
            c.strokeStyle = sec;
            c.lineWidth = lineWidth * 2;
            c.stroke();
          }
  
          // Draw our path
          console.log(lineCap);
          c.lineCap = lineCap;
          c.moveTo(start.x, start.y);
          c.lineTo(end.x, end.y);
          c.strokeStyle = color;
          c.lineWidth = lineWidth;
          c.stroke();
          c.closePath();
        }
      }
  
     
  
      if (canvasRef.current) {
        const renderCtx = canvasRef.current.getContext('2d');
  
        if (renderCtx) {
          canvasRef.current.addEventListener('mousedown', handleMouseDown);
          canvasRef.current.addEventListener('mouseup', handleMouseUp);
          canvasRef.current.addEventListener('mousemove', handleMouseMove);
          canvasRef.current.addEventListener('mouseleave', handleMouseUp)
  
          canvasOffsetLeft = canvasRef.current.offsetLeft;
          canvasOffsetTop = canvasRef.current.offsetTop;
  
          setc(renderCtx);
        }
      }
  

  
      return function cleanup() {
        if (canvasRef.current) {
          canvasRef.current.removeEventListener('mousedown', handleMouseDown);
          canvasRef.current.removeEventListener('mouseup', handleMouseUp);
          canvasRef.current.removeEventListener('mousemove', handleMouseMove);
        }
      }
    }, [c, color, lineWidth, write, message, sec, isS, shape, isShapes, lineCap]);

    function downloadCanvas(){
      const dataURI = canvasRef.current.toDataURL()
      
      //IE, Edge
      if(window.navigator.msSaveBlob){
        window.navigator.msSaveBlob(canvasRef.current.msToBlob(), "your_edited_photo.png")
      } else {
        setAtag(dataURI)
        setClickable(true)
      }
    }
    function click(e){
      if(clickable && e){
        e.click()
        setClickable(false)
      }
    }
    function clearCanvas(){
      c.clearRect(0, 0, cw, ch)
    }
    function fillFull(){
      c.fillStyle = color;
      c.fillRect(0, 0, cw, ch)
    }

    function send(){
      var dataURL = canvasRef.current.toDataURL().replace("data:image/png;base64,","")
      const uploadTask = firebase.storage()
      .ref('/imgs')
      .child(uuidv4())
      .putString(dataURL, 'base64', {contentType:'image/jpg'});
      window.location = "/"
    }

    function uuidv4() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r && 0x3 | 0x8);
        return v.toString(16);
      });
    }
  
    return (
        <div>

            <input onChange={(e)=>setcw(e.target.value)} min="50" max="1300" value={cw} type="number" placeholder="width"/>
            <input onChange={(e)=>setch(e.target.value)} min="50" max="500" value={ch} type="number" placeholder="heigth" />
            <button draggable={false} className="clear" onClick={clearCanvas}>clear</button>
            <a className="download" href="/">leave without saving</a>

            <canvas
                id="canvas"
                ref={canvasRef}
                width={cw}
                height={ch}
            ></canvas>
            <input min="1" id="range" onChange={e => setLineWidth(e.target.value)} value={lineWidth} type="range" />
            <label htmlFor="range">{lineWidth}</label>
            <input type="color" onChange={(e)=>setColor(e.target.value)} value={color} />
            <input className={isS ? "" : "no"} type="color" onChange={(e)=>setSec(e.target.value)} value={sec} />

            <button onClick={fillFull}>fill</button>
            <button className={write ? "textB" : ""} onClick={()=>setWrite(!write)}>add text</button>
            <input className={write ? "" : "no"} onChange={(e)=>setMessage(e.target.value)} value={message} type="text" />
            <button className={isS ? "textB" : ""} onClick={()=>setIsS(!isS)}>secondary</button>
            <button className={isShapes ? "textB" : ""} onClick={()=>{setIsShapes(!isShapes)}}>shapes</button>
            <div className={isShapes ? "" : "no"}>
              <select value={shape} onChange={(e)=>setShape(e.target.value)} name="shape" id="shape">
                <option value="fillRect">rectangle</option>
                <option value="arc">circle</option>
                <option value="lineTo">polygon</option>
              </select>
            </div>
            <select value={lineCap} onChange={(e)=>setLineCap(e.target.value)} name="lineCap" id="lineCap">      
                <option value="round">round</option>
                <option value="butt">none</option>
                <option value="square">square</option>
            </select>

            <button className="download" onClick={send}>send</button>
            <button className="download" onClick={downloadCanvas}>download</button>
            <a ref={click} className="no" download="your_edited_photo.png" href={atag}>.</a>
        </div>
    )
}

export default Editor;
