let workTime = 25 * 60; // 25 минут в секундах
let breakTime = 5 * 60; // 5 минут в секундах
let longBreakTime = 15 * 60; // 15 минут в секундах
let timeLeft = workTime;
let isRunning = false;
let isWorkTime = true;
let interval;
let pomodoroCount = 1;


function updateBadge() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const badgeText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  chrome.action.setBadgeText({ text: badgeText });


  if (isWorkTime) {
    chrome.action.setBadgeBackgroundColor({ color: '#72d976' });
  } else {
    chrome.action.setBadgeBackgroundColor({ color: '#e06c52' });
  }
}


function startTimer() {
  if (!isRunning) {
    isRunning = true;
    interval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateBadge();
        if (timeLeft < 3) playSound();
      } else {
        clearInterval(interval);
        isRunning = false;
        if (isWorkTime) {
          if (pomodoroCount % 2 === 0) {
            timeLeft = longBreakTime;
          } else {
            timeLeft = breakTime;
          }
          pomodoroCount++;
        } else {
          timeLeft = workTime;
        }
        isWorkTime = !isWorkTime;
        startTimer();
      }
    }, 1000);
  }
}


function stopTimer() {
  clearInterval(interval);
  isRunning = false;
}


function resetTimer() {
  clearInterval(interval);
  isRunning = false;
  isWorkTime = true;
  timeLeft = workTime;
  pomodoroCount = 1;
  updateBadge();
  chrome.action.setBadgeText({ text: '' });
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTimer") {
    startTimer();
  } else if (request.action === "stopTimer") {
    stopTimer();
  } else if (request.action === "resetTimer") {
    resetTimer();
  } else if (request.action === "getState") {
    sendResponse({
      timeLeft,
      isRunning,
      isWorkTime,
      pomodoroCount,
    });
  }
});


async function playSound(source = 'bell.mp3', volume = 1) {
  await createOffscreen();
  await chrome.runtime.sendMessage({ play: { source, volume } });
}

async function createOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'testing'
  });
}
