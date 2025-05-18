function changeMainVideo(videoPath, title, desc, index) {
    // Atualiza o título do vídeo principal
    document.getElementById("mainTitle").textContent = title;
    
    // Atualiza o vídeo principal
    const mainVideo = document.getElementById("video-1");
    mainVideo.src = videoPath;

    // Atualiza a descrição corretamente
    const shortText = document.querySelector(".short-text");
    const fullText = document.querySelector(".full-text");
    const readMoreBtn = document.querySelector(".read-more-btn");

    if (desc) {
        shortText.textContent = desc.substring(0, 100);
        fullText.textContent = desc;
        fullText.style.display = "none"; // Oculta o texto completo ao trocar de vídeo

        // Exibe o botão "Ler mais" apenas se houver mais de 100 caracteres
        if (desc.length > 100) {
            readMoreBtn.style.display = "inline";
            readMoreBtn.textContent = " Ler mais ";
        } else {
            readMoreBtn.style.display = "none";
        }
    } else {
        shortText.textContent = "Sem descrição disponível.";
        fullText.textContent = "";
        readMoreBtn.style.display = "none";
    }
}
