const frameEl = document.querySelector(".camera-frame");
const streamEl = document.querySelector(".camera-stream");
const placeholderEl = document.querySelector(".camera-placeholder");

export function initStreamUI() {
    streamEl.removeAttribute("src");
    frameEl.dataset.empty = "1";
}

export function updateImageFrame({ format = "jpeg", data }) {
    if (!data) return;

    frameEl.dataset.empty = "0";
    if (!streamEl.src) streamEl.removeAttribute("src");
    streamEl.src = `data:image/${format};base64,${data}`;
}

export function setNoSignal(text = "Waiting for stream…") {
    placeholderEl.textContent = text;
    streamEl.removeAttribute("src");
    frameEl.dataset.empty = "1";
}

export function parseResolution(str) {
    const [w, h] = str.split("x").map(Number);
    return { w, h };
}