export function createCardDOM(data) {
    const scene = document.createElement('div');
    // Mobile-first sizing
    scene.className = 'flashcard-scene w-[85vw] h-[60vh] md:w-[380px] md:h-[520px] mx-auto mt-6 relative z-10';

    const inner = document.createElement('div');
    inner.className = 'flashcard-inner';

    // --- FRONT BUILDER ---
    let frontHTML = '';
    
    // We remove 'font-sans' here to let the global font take over
    if (data.type === 'JAPANESE') {
        frontHTML = `
            <div class="flex flex-col items-center justify-center h-full">
                <span class="text-xl text-gray-400 font-medium mb-1">${data.front.extra}</span>
                <span class="text-7xl font-black text-gray-800 font-jp mb-4 leading-tight">${data.front.main}</span>
                ${data.front.sub ? `<span class="px-3 py-1 bg-indigo-50 text-indigo-600 font-bold uppercase tracking-wider text-xs rounded-lg">${data.front.sub}</span>` : ''}
            </div>
        `;
    } else if (data.type === 'NON_LATIN') {
        frontHTML = `
             <div class="flex flex-col items-center justify-center h-full">
                <div class="text-6xl font-black text-gray-800 mb-6 leading-tight">${data.front.main}</div>
                ${data.front.sub ? `<div class="px-3 py-1 bg-indigo-50 text-indigo-600 font-bold uppercase tracking-wider text-xs rounded-lg">${data.front.sub}</div>` : ''}
            </div>
        `;
    } else {
        frontHTML = `
             <div class="flex flex-col items-center justify-center h-full">
                <div class="text-5xl font-black text-gray-800 leading-tight text-center break-words px-2">
                    ${data.front.main}
                </div>
            </div>
        `;
    }

    // --- FRONT FACE ---
    const front = document.createElement('div');
    front.className = 'card-face card-front bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-gray-100 flex flex-col p-6';
    front.innerHTML = `
        <div class="w-full flex justify-between items-center opacity-30 mb-4">
            <span class="text-[10px] font-black uppercase tracking-widest">Question</span>
            <span class="text-[10px] font-black uppercase tracking-widest">Tap to Flip</span>
        </div>
        <div class="flex-grow w-full relative">
            ${frontHTML}
        </div>
    `;

    // --- BACK FACE ---
    const back = document.createElement('div');
    // Added 'items-center text-center' for horizontal centering
    back.className = 'card-face card-back bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-gray-100 flex flex-col items-center text-center p-6 pt-10';
    
    back.innerHTML = `
        <span class="absolute top-6 text-[10px] font-black text-gray-300 uppercase tracking-widest">Answer</span>
        
        <div class="flex-grow flex items-center justify-center w-full">
            <h2 class="text-3xl font-extrabold text-indigo-600 leading-tight">
                ${data.back.definition}
            </h2>
        </div>
        
        <div class="w-full bg-gray-50 rounded-2xl p-4 text-left border border-gray-100">
            <p class="text-base text-gray-800 font-semibold mb-1 leading-snug">
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
