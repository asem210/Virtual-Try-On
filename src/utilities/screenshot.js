export const captureFrame = (webcam, setImage) => {
  const imageSrc = webcam.current.getScreenshot();
  console.log(imageSrc);
  setImage(imageSrc);
};
