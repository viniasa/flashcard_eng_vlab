import { firebaseConfig } from "../logreg/config.js";
// Firebase Auth dan Firestore Initialization
const firebaseApp = firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "/logreg";
  }
});

const questions = [
    {
        question: "What does 'unity' in a paragraph refer to?",
        options: [
            "The arrangement of sentences", 
            "The use of transitions", 
            "The focus on a single idea", 
            "The length of the paragraph"
        ],
        answer: "The focus on a single idea"
    },
    {
        question: "What does 'coherence' mean in the context of writing?",
        options: [
            "The use of complex vocabulary", 
            "The inclusion of multiple topics", 
            "The logical flow and connection of ideas", 
            "The length of each sentence"
        ],
        answer: "The logical flow and connection of ideas"
    },
    {
        question: "Which of the following sentences demonstrates a lack of coherence?",
        options: [
            "We proudly serve our community and offer competitive prices.", 
            "I have a large family, and we enjoy Sunday dinners.", 
            "There are several reasons to select my company to do this job.", 
            "We have successfully kept our overhead low."
        ],
        answer: "I have a large family, and we enjoy Sunday dinners."
    },
    {
        question: "What is an example of a transition word that indicates comparison?",
        options: [
            "Therefore", 
            "However", 
            "Additionally", 
            "For instance"
        ],
        answer: "However"
    },
    {
        question: "Which type of transition is used to show cause-effect relations?",
        options: [
            "On the other hand", 
            "As a result", 
            "Before", 
            "Similarly"
        ],
        answer: "As a result"
    },
    {
        question: "What is the primary purpose of using transitions in writing?",
        options: [
            "To introduce new ideas", 
            "To make paragraphs longer", 
            "To create cohesion between sentences and paragraphs", 
            "To increase word count"
        ],
        answer: "To create cohesion between sentences and paragraphs"
    },
    {
        question: "Which of the following best describes a paragraph with good unity?",
        options: [
            "It focuses on a single main idea supported by relevant details.", 
            "It has many complex sentences.", 
            "It contains multiple unrelated ideas.", 
            "It includes various examples and illustrations."
        ],
        answer: "It focuses on a single main idea supported by relevant details."
    },
    {
        question: "What does it mean for sentences in a coherent paragraph?",
        options: [
            "They contain unrelated information.", 
            "They can be rearranged without changing the meaning.", 
            "They all support the main idea and flow logically.", 
            "They must be long and complex."
        ],
        answer: "They all support the main idea and flow logically."
    },
    {
        question: "Which transition would you use to introduce an example?",
        options: [
            "For instance", 
            "However", 
            "Meanwhile", 
            "Therefore"
        ],
        answer: "For instance"
    },
    {
        question: "In the provided examples, what characteristic does the paragraph with coherence have?",
        options: [
            "All sentences clearly support the main point.", 
            "It includes irrelevant details about the author’s family.", 
            "It uses no transition words.", 
            "Sentences are randomly organized."
        ],
        answer: "All sentences clearly support the main point."
    }
];

let currentQuestionIndex = 0;
let score = 0;

function showQuestion() {
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    optionsElement.innerHTML = '';

    const currentQuestion = questions[currentQuestionIndex];
    questionElement.innerText = currentQuestion.question;

    currentQuestion.options.forEach(option => {
        const li = document.createElement('li');
        li.classList.add('option');

        const circle = document.createElement('div');
        circle.classList.add('option-circle');

        const text = document.createElement('span');
        text.classList.add('option-text');
        text.innerText = option;

        li.appendChild(circle);
        li.appendChild(text);
        li.addEventListener('click', () => checkAnswer(option, li));
        optionsElement.appendChild(li);
    });

    updateNavigationButtons();
}

function checkAnswer(selectedOption, selectedElement) {
    const correctAnswer = questions[currentQuestionIndex].answer;
    const options = document.querySelectorAll('.option');

    options.forEach(option => {
        const optionText = option.querySelector('.option-text').innerText;
        if (optionText === correctAnswer) {
            option.classList.add('correct');
        } else {
            option.classList.add('wrong');
        }
        option.style.pointerEvents = 'none'; 
    });

    if (selectedOption === correctAnswer) score++;

    document.getElementById('next-button').classList.remove('hidden');
}

function updateNavigationButtons() {
    const backButton = document.getElementById('back-button');
    const nextButton = document.getElementById('next-button');

    backButton.classList.toggle('hidden', currentQuestionIndex === 0);
    nextButton.classList.add('hidden'); 

    if (currentQuestionIndex === questions.length - 1) {
        nextButton.innerText = 'Submit';
    } else {
        nextButton.innerText = 'Next';
    }
}

document.getElementById('next-button').addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        showResult();
    }
});

document.getElementById('back-button').addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
});

function showResult() {
    const resultElement = document.getElementById('result');
    resultElement.innerText = `Kuis selesai! Skor Anda: ${score} dari ${questions.length}.`;
    resultElement.classList.remove('hidden');
    document.getElementById('reset-button').classList.remove('hidden');
    document.getElementById('next-button').classList.add('hidden');
    document.getElementById('back-button').classList.add('hidden');
}

document.getElementById('reset-button').addEventListener('click', () => {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('result').classList.add('hidden');
    document.getElementById('reset-button').classList.add('hidden');
    showQuestion();
});

showQuestion();
