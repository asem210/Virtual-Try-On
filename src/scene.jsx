import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import { drawKeypoints, drawSkeleton } from "./utilities/poses";
import Webcam from "react-webcam";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
function Home() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState("");
  const [scene, setScene] = useState(null);

  useEffect(() => {
    if (capturedImage !== "") {
      runPosenet();
    }
  }, [capturedImage]);

  const captureFrame = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  };

  const runPosenet = async () => {
    const net = await posenet.load({
      inputResolution: { width: 640, height: 480 },
      scale: 0.8,
    });

    detect(net);
  };

  const detect = async (net) => {
    if (capturedImage && imageRef.current && imageRef.current.complete) {
      const image = imageRef.current;
      const imageWidth = image.width;
      const imageHeight = image.height;

      const pose = await net.estimateSinglePose(image);
      console.log(pose);

      updateGarmentPosition(pose.keypoints);
    }
  };

  const updateGarmentPosition = (keypoints) => {
    const garmentObject = scene.getObjectByName("garment");

    if (garmentObject) {
      const { x, y } = keypoints[0].position;
      const videoWidth = 640;
      const videoHeight = 480;
      const mappedX = (x / videoWidth) * 2 - 1;
      const mappedY = -(y / videoHeight) * 2 + 1;

      garmentObject.position.x = mappedX;
      garmentObject.position.y = mappedY;
    }
  };

  useEffect(() => {
    const initScene = () => {
      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 5;

      const loader = new OBJLoader();
      loader.load("ruta/al/archivo.obj", function (object) {
        object.name = "garment";
        scene.add(object);
      });

      setScene(scene);
    };

    initScene();
  }, []);

  return (
    <div className="App">
      <div className="App-tittle">
        <h1>Virtual Try On Application Demo</h1>
      </div>

      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            textAlign: "center",
            zIndex: 0,
            width: 640,
            height: 480,
          }}
          screenshotFormat="image/jpeg"
        />
      </header>

      <div className="app-button">
        <div className="app-container-button">
          <button onClick={captureFrame}>Realizar simulación</button>
        </div>
        <div className="app-result-image">
          <img
            src={capturedImage}
            alt="Captured Frame"
            ref={imageRef}
            style={{
              marginLeft: "auto",
              marginRight: "auto",
              textAlign: "center",
              zIndex: 0,
              width: 640,
              height: 480,
            }}
          />
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}

export default Home;
