function toggleReadMore(element) {
    const shortText = document.querySelector(".short-text");
    const fullText = document.querySelector(".full-text");

    if (fullText.style.display === "none" || fullText.style.display === "") {
        fullText.style.display = "inline";
        shortText.style.display = "none";
        element.textContent = " Ler menos ";
    } else {
        fullText.style.display = "none";
        shortText.style.display = "inline";
        element.textContent = " Ler mais ";
    }
}
