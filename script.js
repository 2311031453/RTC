// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Clock Elements
const currentTimeElement = document.getElementById('current-time');
const currentDateElement = document.getElementById('current-date');

// Timer Elements
const timerTimeElement = document.getElementById('timer-time');
const timerStartButton = document.getElementById('timer-start');
const timerPauseButton = document.getElementById('timer-pause');
const timerResetButton = document.getElementById('timer-reset');
const timerMinutesInput = document.getElementById('timer-minutes');
const timerSecondsInput = document.getElementById('timer-seconds');
const timerSetButton = document.getElementById('timer-set');

// Stopwatch Elements
const stopwatchTimeElement = document.getElementById('stopwatch-time');
const stopwatchStartButton = document.getElementById('stopwatch-start');
const stopwatchPauseButton = document.getElementById('stopwatch-pause');
const stopwatchResetButton = document.getElementById('stopwatch-reset');
const lapsContainer = document.getElementById('laps-container');

// State variables
let theme = localStorage.getItem('theme') || 'light';
let timerInterval = null;
let stopwatchInterval = null;
let timerTime = 1500; // 25 minutes in seconds
let stopwatchTime = 0;
let stopwatchRunning = false;
let timerRunning = false;
let laps = [];

// Initialize theme
function initTheme() {
    document.documentElement.setAttribute('data-theme', theme);
    themeIcon.src = theme === 'light' ? 'assets/dark.svg' : 'assets/light.svg';
}

// Switch tabs
function switchTab(tabName) {
    tabButtons.forEach(button => {
        if (button.dataset.tab === tabName) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    tabContents.forEach(content => {
        if (content.id === tabName) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Update clock
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('id-ID');
    const date = now.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    currentTimeElement.textContent = time;
    currentDateElement.textContent = date;
}

// Format time
function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Timer functions
function updateTimerDisplay() {
    timerTimeElement.textContent = formatTime(timerTime);
}

function startTimer() {
    if (timerRunning) return;
    
    timerRunning = true;
    timerInterval = setInterval(() => {
        if (timerTime > 0) {
            timerTime--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            timerRunning = false;
            alert('Timer selesai!');
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
}

function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    const minutes = parseInt(timerMinutesInput.value) || 0;
    const seconds = parseInt(timerSecondsInput.value) || 0;
    timerTime = minutes * 60 + seconds;
    updateTimerDisplay();
}

function setTimer() {
    const minutes = parseInt(timerMinutesInput.value) || 0;
    const seconds = parseInt(timerSecondsInput.value) || 0;
    timerTime = minutes * 60 + seconds;
    
    if (timerTime <= 0) {
        alert('Waktu timer tidak valid');
        timerTime = 1500; // Default to 25 minutes
        timerMinutesInput.value = 25;
        timerSecondsInput.value = 0;
    }
    
    updateTimerDisplay();
}

// Stopwatch functions
function updateStopwatchDisplay() {
    stopwatchTimeElement.textContent = formatTime(stopwatchTime);
}

function startStopwatch() {
    if (stopwatchRunning) return;
    
    stopwatchRunning = true;
    const startTime = Date.now() - stopwatchTime * 1000;
    
    stopwatchInterval = setInterval(() => {
        stopwatchTime = Math.floor((Date.now() - startTime) / 1000);
        updateStopwatchDisplay();
    }, 1000);
}

function pauseStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchRunning = false;
}

function resetStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchRunning = false;
    stopwatchTime = 0;
    updateStopwatchDisplay();
    laps = [];
    updateLaps();
}

function addLap() {
    laps.push(stopwatchTime);
    updateLaps();
}

function updateLaps() {
    lapsContainer.innerHTML = '';
    
    laps.forEach((lapTime, index) => {
        const lapElement = document.createElement('div');
        lapElement.classList.add('lap-item');
        lapElement.textContent = `Putaran ${index + 1}: ${formatTime(lapTime)}`;
        lapsContainer.appendChild(lapElement);
    });
}

// Event Listeners
themeToggle.addEventListener('click', () => {
    theme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    initTheme();
});

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        switchTab(button.dataset.tab);
    });
});

// Timer events
timerStartButton.addEventListener('click', startTimer);
timerPauseButton.addEventListener('click', pauseTimer);
timerResetButton.addEventListener('click', resetTimer);
timerSetButton.addEventListener('click', setTimer);

// Stopwatch events
stopwatchStartButton.addEventListener('click', startStopwatch);
stopwatchPauseButton.addEventListener('click', pauseStopwatch);
stopwatchResetButton.addEventListener('click', resetStopwatch);
stopwatchTimeElement.addEventListener('click', addLap);

// Initialize
initTheme();
updateClock();
setInterval(updateClock, 1000);
updateTimerDisplay();
updateStopwatchDisplay();

// PWA Code
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Handle before install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});