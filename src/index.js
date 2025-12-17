import './styles/main.scss'; // Import SCSS so Webpack handles it
import { vocabList } from './data/vocab';
import { createCardDOM } from './components/Card';

let currentIndex = 0;
const container = document.getElementById('card-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

function renderCard(index) {
    // Clear existing card
    container.innerHTML = '';
    
    // Get Data
    const data = vocabList[index];
    
    // Create DOM and append
    const cardElement = createCardDOM(data);
    container.appendChild(cardElement);
}

// Initial Render
renderCard(currentIndex);

// Button Logic
nextBtn.addEventListener('click', () => {
    if (currentIndex < vocabList.length - 1) {
        currentIndex++;
        renderCard(currentIndex);
    } else {
        // Optional: Loop back to start
        currentIndex = 0; 
        renderCard(currentIndex);
    }
});

prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        renderCard(currentIndex);
    }
});
