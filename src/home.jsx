import React, { useRef, useState, useEffect } from "react";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import { drawKeypoints, drawSkeleton } from "./utilities/poses";
import Webcam from "react-webcam";
import * as THREE from "three";
import { SkinnedMesh, Skeleton } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import SceneInit from "./utilities/sceneinit";

// import DeteccionPersonas from "./utilities/persondetection";

import normalPose from "../assets/normalpose-removebg-preview.png";
import tpose from "../assets/tpose-removebg-preview.png";

function Home() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState("");
  const [poseEstimated, setPoseEstimated] = useState("");
  const [objectpath, setObjectPath] = useState(null);
  const [persondetected, setPersonDetected] = useState(true);

  const xMin = -1;
  const xMax = 1;
  const yMin = -0.25;
  const yMax = 0.25;

  let leftShoulder = 0;
  let rightShoulder = 0;
  let leftHip = 0;
  let rightHip = 0;

  let torsoPosition = 0;

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
      setPoseEstimated(pose);

      //   drawCanvas(pose, image, imageWidth, imageHeight, canvasRef);
    }
  };

  useEffect(() => {
    if (poseEstimated) {
      const test = new SceneInit("myThreeJsCanvas");
      test.initialize();
      test.animate();

      console.log(poseEstimated);

      leftShoulder = poseEstimated.keypoints[5].position;
      rightShoulder = poseEstimated.keypoints[6].position;
      leftHip = poseEstimated.keypoints[11].position;
      rightHip = poseEstimated.keypoints[12].position;

      torsoPosition = {
        x:
          ((leftShoulder.x / 640) * (xMax - xMin) +
            xMin +
            ((rightShoulder.x / 640) * (xMax - xMin) + xMin)) /
            2 -
          0.3,
        y:
          ((rightShoulder.y / 480) * (yMax - yMin) +
            yMin +
            ((leftHip.y / 480) * (yMax - yMin) + yMin)) /
            2 -
          0.25,
      };

      console.log(torsoPosition);

      let loadedModel;
      const glftLoader = new GLTFLoader();
      glftLoader.load(objectpath, (gltfScene) => {
        if (objectpath == "../assets/t_shirt (1).gltf") {
          console.log(persondetected);
          loadedModel = gltfScene;
          const skinnedmesh = loadedModel.scene.children[1].children[0];
          const object = loadedModel.scene.children[1];
          object.position.set(torsoPosition.x, torsoPosition.y, 0);
          object.rotation.y = Math.PI;
          console.log(object);

          test.scene.add(object);
        } else {
          console.log(persondetected);
          loadedModel = gltfScene;
          const object = loadedModel.scene;
          object.position.set(torsoPosition.x, torsoPosition.y, 0);
          object.rotation.y = 2.4;
          console.log(object);
          test.scene.add(object);
        }
      });
    }
  }, [poseEstimated]);

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
        <div className="app-container-poses-mode">
          <div>
            <h3>Elige una pose</h3>
            <div className="app-container-images-poses">
              <button
                onClick={() => setObjectPath("../assets/t_shirt (1).gltf")}
              >
                <img src={normalPose} alt="Default pose" />
              </button>
              <button
                onClick={() => setObjectPath("../assets/tpose(shirt).gltf")}
              >
                {" "}
                <img src={tpose} alt="T_Pose" />
              </button>
            </div>
          </div>
        </div>
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
              width: 640,
              height: 480,
            }}
          />
          <canvas
            ref={canvasRef}
            id="myThreeJsCanvas"
            style={{
              width: 640,
              height: 480,
              marginLeft: "auto",
              marginRight: "auto",
              marginTop: "-480px",
              zIndex: 6,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
