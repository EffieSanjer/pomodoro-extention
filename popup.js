const timerDisplay = document.getElementById('session-timer-display');
const statusDisplay = document.getElementById('status-display');
const sessionDisplay = document.getElementById('session-number-display');
const startButton = document.getElementById('start-timer');
const resetButton = document.getElementById('reset-timer');

let timeLeft = 25 * 60;
let isRunning = false;
let isWorkTime = true;
let sessionCount = 1;


function updateTimer() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}


function updateStatus() {
  if (isRunning) {
    if (isWorkTime) {
      statusDisplay.textContent = 'Work Time';
      sessionDisplay.textContent = sessionCount;
    } else {
      statusDisplay.textContent = (sessionCount + 1) % 2 === 0 ? 'Long Break' : 'Break Time';
    }

    resetButton.classList.remove('hidden');
  }
}

function switchTimer(state = null) {
  if (!state)
    state = isRunning ? 'pause' : 'start';

  const ellipse = document.querySelector('.ellipse');
  const ellipseStroke = document.querySelector('.ellipse-stroke');

  switch (state) {
    case 'start':
      ellipse.classList.remove('playing');
      ellipseStroke.classList.remove('playing');
      startButton.querySelector('#play').hidden = false;
      startButton.querySelector('#pause').hidden = true;
      break
    case 'pause':
      ellipse.classList.add('playing');
      ellipseStroke.classList.add('playing');
      startButton.querySelector('#play').hidden = true;
      startButton.querySelector('#pause').hidden = false;
      break
  }
}


function fetchState() {
  chrome.runtime.sendMessage({ action: "getState" }, (response) => {
    timeLeft = response.timeLeft;
    isRunning = response.isRunning;
    isWorkTime = response.isWorkTime;
    sessionCount = response.pomodoroCount;
    updateTimer();
    updateStatus();
    switchTimer();
  });
}


function startTimer() {
  chrome.runtime.sendMessage({ action: "startTimer" });
  switchTimer('pause');
  resetButton.classList.remove('hidden');
}

function resetTimer() {
  resetButton.classList.add('hidden');
  chrome.runtime.sendMessage({ action: "resetTimer" });
  switchTimer('start');
  statusDisplay.innerHTML = `&nbsp;`
}

startButton.addEventListener('click', () => {
  if (isRunning) {
    chrome.runtime.sendMessage({ action: "stopTimer" });
    switchTimer('start');
  } else {
    startTimer();
  }
  isRunning = !isRunning;
});

resetButton.addEventListener('click', resetTimer);


fetchState();
setInterval(fetchState, 1000);
