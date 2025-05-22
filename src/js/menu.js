const videos = [
    "src/assets/video/leyendzeldaV1.mp4",
    "src/assets/video/pokemonV2.mp4",
    "src/assets/video/smashbroV3.mp4",
    "src/assets/video/snowV4.mp4"
];

let currentIndex = 0;
const videoElement = document.getElementById("main-video");
const prevButton = document.querySelector(".prev-btn");
const nextButton = document.querySelector(".next-btn");

let autoChange = setInterval(nextVideo, 5000); // Cambio automático cada 5 segundos

// Función para cambiar de video
function changeVideo(index, stopAuto = false) {
    currentIndex = index;
    videoElement.src = videos[currentIndex];
    videoElement.play(); // Reproduce automáticamente

    if (stopAuto) {
        clearInterval(autoChange); // Detiene el cambio automático
    }
}

// Función para avanzar de video
function nextVideo() {
    currentIndex = (currentIndex + 1) % videos.length;
    changeVideo(currentIndex);
}

// Botón anterior
prevButton.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + videos.length) % videos.length;
    changeVideo(currentIndex, true);
});

// Botón siguiente
nextButton.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % videos.length;
    changeVideo(currentIndex, true);
});