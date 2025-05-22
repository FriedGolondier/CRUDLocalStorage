const { jsPDF } = window.jsPDF;
import DataManager from "./DataManager.js";

document.addEventListener('DOMContentLoaded', function () {

    document.getElementById("btnPdfGenerate").addEventlistener("click", async () => {
        try {
            const url = "imgurl";
            const datosImagen = await cargarImagen(url);
        } catch (error) {

        }
    });


});

function cargarImagen(urlImagen) {
    return new Promise(function (resolve, reject) {
        let img = new Image();
        img.crossOrigin = "anonymous"
        img.onload = function () {
            const canvas = document.createElement("canvas");
            const contexto = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            contexto.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL("image/JPG");
            resolve(dataUrl)
        }
    })
}
