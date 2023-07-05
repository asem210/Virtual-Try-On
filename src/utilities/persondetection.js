import React, { useEffect } from "react";

const DeteccionPersonas = () => {
  useEffect(() => {
    // Carga el modelo preentrenado
    const classifier = new cv.CascadeClassifier();
    classifier.load("../../model/hog_classifier.xml"); // Reemplaza la ruta con la ubicación del modelo descargado

    // Función para realizar la detección de personas
    const detectarPersonas = async () => {
      // Obtiene el elemento de imagen o video donde se realizará la detección
      const imagenElemento = document.getElementById("imagen");

      // Carga la imagen utilizando OpenCV.js
      const imagen = cv.imread(imagenElemento);

      // Realiza la detección de personas
      const personas = new cv.RectVector();
      classifier.detectMultiScale(imagen, personas);

      // Verifica si se detectaron personas
      const hayPersonas = personas.size() > 0;

      // Imprime "true" en la consola si se detectaron personas
      if (hayPersonas) {
        console.log(true);
      }

      // Liberar recursos
      imagen.delete();
      personas.delete();
    };

    detectarPersonas();
  }, []);

  return (
    <div>
      {/* <h1>Detección de personas</h1>
      <img id="imagen" src="/ruta/a/imagen.jpg" alt="Imagen" />
      <canvas id="canvas" /> */}
    </div>
  );
};

export default DeteccionPersonas;
