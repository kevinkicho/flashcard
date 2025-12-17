export function createCardDOM(data) {
    // Create the container scene
    const scene = document.createElement('div');
    scene.classList.add('flashcard-scene');

    // Create the inner moving part
    const inner = document.createElement('div');
    inner.classList.add('flashcard-inner');

    // FRONT SIDE
    const front = document.createElement('div');
    front.classList.add('card-face', 'card-front');
    front.innerHTML = `
        <h2>${data.japanese}</h2>
        <p>${data.reading}</p>
        <small>(Tap to flip)</small>
    `;

    // BACK SIDE
    const back = document.createElement('div');
    back.classList.add('card-face', 'card-back');
    back.innerHTML = `
        <h2>${data.english}</h2>
        <div class="sentence">
            <p>${data.sentenceJp}</p>
            <p>${data.sentenceEn}</p>
        </div>
    `;

    // Assemble them
    inner.appendChild(front);
    inner.appendChild(back);
    scene.appendChild(inner);

    // Add Click Event for Animation
    scene.addEventListener('click', () => {
        inner.classList.toggle('is-flipped');
    });

    return scene;
}
