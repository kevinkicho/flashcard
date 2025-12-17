export function createCardDOM(data) {
    // 1. Structure
    const scene = document.createElement('div');
    // Tailwind: Mobile width 90%, Desktop fixed width, fixed height, centered margin
    scene.className = 'flashcard-scene w-[90vw] h-[65vh] md:w-[400px] md:h-[550px] mx-auto mb-8';

    const inner = document.createElement('div');
    inner.className = 'flashcard-inner';

    // --- FRONT CONTENT ---
    let frontContent = '';
    
    // Using Tailwind Typography
    if (data.type === 'JAPANESE') {
        frontContent = `
            <div class="flex flex-col items-center">
                <span class="text-lg text-gray-500 font-medium mb-2">${data.front.extra}</span>
                <span class="text-7xl font-black text-gray-800 font-jp mb-6 leading-tight">${data.front.main}</span>
                <span class="px-4 py-1 bg-indigo-50 text-indigo-600 font-bold uppercase tracking-widest text-sm rounded-full">
                    ${data.front.sub}
                </span>
            </div>
        `;
    } else if (data.type === 'NON_LATIN') {
        frontContent = `
            <div class="text-6xl font-black text-gray-800 mb-6 leading-tight">${data.front.main}</div>
            <div class="px-4 py-1 bg-indigo-50 text-indigo-600 font-bold uppercase tracking-widest text-sm rounded-full inline-block">
                ${data.front.sub}
            </div>
        `;
    } else {
        frontContent = `
            <div class="text-5xl font-black text-gray-800 leading-tight text-center px-4">
                ${data.front.main}
            </div>
        `;
    }

    // --- FRONT FACE ---
    const front = document.createElement('div');
    front.className = 'card-face card-front bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center justify-between p-8';
    front.innerHTML = `
        <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Tap to Flip</span>
        <div class="flex-grow flex items-center justify-center w-full">
            ${frontContent}
        </div>
        <div class="h-4"></div> `;

    // --- BACK FACE ---
    const back = document.createElement('div');
    // Tailwind: Flex layout starting from top (justify-start)
    back.className = 'card-face card-back bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col items-start justify-start p-8 pt-12 relative';
    
    back.innerHTML = `
        <span class="absolute top-8 left-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Meaning</span>
        
        <div class="mt-8 mb-auto">
            <h2 class="text-4xl font-extrabold text-indigo-600 leading-tight text-left">
                ${data.back.definition}
            </h2>
        </div>
        
        <div class="w-full bg-gray-50 rounded-xl p-5 border border-gray-200 text-left">
            <p class="text-lg text-gray-800 font-semibold mb-2 leading-relaxed">
                ${data.back.sentenceTarget}
            </p>
            <p class="text-sm text-gray-500 italic">
                ${data.back.sentenceOrigin}
            </p>
        </div>
    `;

    inner.appendChild(front);
    inner.appendChild(back);
    scene.appendChild(inner);

    scene.addEventListener('click', () => {
        inner.classList.toggle('is-flipped');
    });

    return scene;
}
