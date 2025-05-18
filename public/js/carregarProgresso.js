const totalGlobalVideos = 10;
let watchedVideos = {};
let userProgress = 0;

function loadProgress() {
    fetch('/get-progress')
        .then(response => response.json())
        .then(data => {
            userProgress = data.progress || 0;
            console.log('Progresso carregado:', userProgress);
        })
        .catch(error => console.error('Erro ao carregar progresso:', error));
}

function updateProgress() {
    const videosWatched = Object.keys(watchedVideos).length;
    const newProgress = (videosWatched / totalGlobalVideos) * 100;
    const totalProgress = Math.min(userProgress + newProgress, 100);

    fetch('/update-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: totalProgress })
    })
    .then(response => {
        if (response.ok) {
            console.log('Progresso atualizado com sucesso!');
            window.location.reload();
        } else {
            console.error('Erro ao atualizar o progresso.');
        }
    })
    .catch(error => console.error('Erro na requisição:', error));
}

function checkVideoProgress(videoElement, videoId) {
    videoElement.addEventListener('ended', () => {
        if (!watchedVideos[videoId]) {
            watchedVideos[videoId] = true;
            updateProgress();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    for (let i = 1; i <= totalGlobalVideos; i++) {
        const videoElement = document.getElementById(`video-${i}`);
        if (videoElement) {
            checkVideoProgress(videoElement, i);
        }
    }
});

function changeMainVideo(path, title, desc, index) {
    const mainVideo = document.getElementById('video-1');
    const mainTitle = document.getElementById('mainTitle');
    const mainDesc = document.querySelector('.desc p'); 

    mainVideo.src = path;
    mainTitle.innerText = title;
    mainDesc.innerText = desc ? desc : 'Descrição não disponível'; // Evita que fique vazio
}
