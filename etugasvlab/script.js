import { firebaseConfig } from "../logreg/config.js";
// Firebase Auth dan Firestore Initialization
const firebaseApp = firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
  if (user) {
  } else {
    window.location.href ="../logreg/index.html";
  }
});

const toggleThemeBtn = document.createElement('button');
toggleThemeBtn.style.position = 'fixed';
toggleThemeBtn.style.top = '10px';
toggleThemeBtn.style.right = '10px';

document.body.appendChild(toggleThemeBtn);

toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

const cards = document.querySelectorAll('.card');

cards.forEach((card) => {
  card.addEventListener('click', () => {
    card.classList.toggle('expanded');
  });
});


document.head.insertAdjacentHTML(
  'beforeend',
  `<style>
    .expanded {
      transform: scale(1.1);
      transition: transform 0.3s ease;
    }
  </style>`
);

const emptyCards = document.querySelectorAll('.card.empty');
const popupModal = document.getElementById('popup-modal');
const closeModal = document.getElementById('close-modal');

emptyCards.forEach((card) => {
  card.addEventListener('click', () => {
    popupModal.classList.remove('hidden');
  });
});

closeModal.addEventListener('click', () => {
  popupModal.classList.add('hidden');
});

const progressBar = document.getElementById('progress-bar');
const progressLabel = document.getElementById('progress-label');
const subCards = document.querySelectorAll('.sub-card');

let progress = 0; 

function updateProgress(newProgress) {
  progress = newProgress;
  progressBar.style.width = `${progress}%`;
  progressLabel.textContent = `${progress}%`;
}

subCards.forEach(card => {
  card.addEventListener('click', (event) => {
    const newProgress = event.target.dataset.progress;
    updateProgress(newProgress);
  });
});

window.addEventListener('load', () => {
  const savedProgress = localStorage.getItem('progress');
  if (savedProgress) {
    updateProgress(savedProgress);
  }
});

progressBar.addEventListener('transitionend', () => {
  localStorage.setItem('progress', progress);
});


let dragged;

document.querySelectorAll('.card').forEach((card) => {
  card.draggable = true;

  card.addEventListener('dragstart', (e) => {
    dragged = card;
    e.target.style.opacity = 0.5;
  });

  card.addEventListener('dragend', (e) => {
    e.target.style.opacity = '';
  });

  card.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  card.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.target.classList.contains('card') && e.target !== dragged) {
      e.target.before(dragged);
    }
  });
});

const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  themeIcon.textContent = '🌙'; 
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');

  if (document.body.classList.contains('dark-mode')) {
    themeIcon.textContent = '🌙'; 
    localStorage.setItem('theme', 'dark'); 
  } else {
    themeIcon.textContent = '🌞'; 
    localStorage.setItem('theme', 'light'); 
  }
});
