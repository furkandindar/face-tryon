import React, {useRef, useEffect} from 'react'
import Webcam from "react-webcam";
import { 
    FaceMesh,
    FACEMESH_TESSELATION,
    FACEMESH_RIGHT_EYE,
    FACEMESH_RIGHT_EYEBROW,
    FACEMESH_LEFT_EYE,
    FACEMESH_LEFT_EYEBROW, 
    FACEMESH_FACE_OVAL, 
    FACEMESH_LIPS 
} from "@mediapipe/face_mesh";
import { drawConnectors } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";

import { Canvas, useFrame } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Suspense } from "react";

const Model = () => {
    const gltf = useLoader(GLTFLoader, "./quay_nightfall.glb");
    const ref = useRef();

    useFrame(()=>{
        ref.current.position.x = -x;
        ref.current.position.y = -y;
    })
    return (
      <>
        <primitive ref={ref} object={gltf.scene} scale={14} />
      </>
    );
  };

var x =0;
var y=0;
var z=0;


const MPFaceMesh = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
      const faceMesh = new FaceMesh({
          locateFile: (file) => {
              console.log(`${file}`);
              return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          }
      });
      faceMesh.setOptions({
        maxNumFaces: 2,
        refineLandmarks: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        enableFaceGeometry: true
      });
      faceMesh.onResults(onResults);

      if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null) {
          const camera = new Camera(webcamRef.current.video, {
              onFrame: async () => {
                  await faceMesh.send({image: webcamRef.current.video});
              },
              width: 640,
              height: 480,
          });
          camera.start();
      }
    }, []);

    const onResults = (results) => {
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement.getContext("2d");
        canvasCtx.save();
        canvasCtx.clearRect(0,0,videoWidth,videoHeight);
        canvasCtx.translate(videoWidth,0);
        canvasCtx.scale(-1,1);
        canvasCtx.drawImage(
            results.image,
            0,
            0,
            canvasElement.width,
            canvasElement.height,
        );

        if(results.multiFaceLandmarks){
            //console.log("found face");
            //console.log(results);
            for (const landmarks of results.multiFaceLandmarks) {
                // drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {
                //     color: "#c0c0c0",
                //     lineWidth: 1,
                // })
                x = landmarks[6].x;
                y = landmarks[6].y;
                z = landmarks[6].z;
            }
        }
        canvasCtx.restore();
    }
    

  return (
    <div>
        <Webcam 
        audio={false}
        mirrored={true} 
        ref={webcamRef}
        style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: "0",
            right: "0",
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
        }}
        />
        <canvas 
        ref={canvasRef}
        style={{
        position: "absolute",
        marginLeft: "auto",
        marginRight: "auto",
        left: "0",
        right: "0",
        textAlign: "center",
        zIndex: 9,
        width: 640,
        height: 480,
        }}
        ></canvas>
        <Canvas
        style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: "0",
            right: "0",
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,}}>
        <Suspense fallback={null}>
          <Model />
          {/* <OrbitControls /> */}
          <Environment preset="sunset" />
        </Suspense>
        </Canvas>
    </div>
  )
}

export default MPFaceMesh