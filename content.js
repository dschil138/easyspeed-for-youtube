let video;
let moviePlayer;
let originalSpeed = 1;
let longPressTimer;
let longPressFlag = false;
let lastVideoElement = null;
let indicator;
let initialX;
let initialY;
let minSpeed = 1.25;
let slowSpeed = 1.5;
let mainSpeed = 2;
let fastSpeed = 3;
let maxSpeed = 5;
let periodKeySpeed = 5;
let commaKeySpeed = 2;
let setPersistentSpeed = false;
let newPersistentSpeed;
let speedPersisting = false;
let rewindInterval;
let firstRewind = true;
let periodPressed = false;
let commaPressed = false;
let hotkeyOriginalSpeed = 1;
let isPeriodKeyDown = false;
let isCommaKeyDown = false;
let keydownTimer;
let lastPeriodKeyReleaseTime = 0;
let lastCommaKeyReleaseTime = 0;
let doubleTapAndHoldPeriod = false;
let doubleTapAndHoldComma = false;
const tier1 = 45;
const tier2 = 165;
const tier3 = 280;
const verticalTier = 65;

const chromeControls = 'ytp-chrome-bottom';

const overlayDiv = document.querySelector('.ytp-doubletap-ui-legacy');

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "runInit") {
      syncSpeeds();
    }
  }
);

function syncSpeeds() {
  chrome.storage.sync.get('minSpeed', function(data) {
    minSpeed = data.minSpeed || 1.25;
  });
  chrome.storage.sync.get('slowSpeed', function(data) {
    slowSpeed = data.slowSpeed || 1.5;
  });
  chrome.storage.sync.get('fastSpeed', function(data) {
    fastSpeed = data.fastSpeed || 3;
  });
  chrome.storage.sync.get('maxSpeed', function(data) {
    maxSpeed = data.maxSpeed || 5;
  });
  chrome.storage.sync.get('periodKeySpeed', function(data) {
    periodKeySpeed = data.periodKeySpeed || 5;
  }
  );
  chrome.storage.sync.get('commaKeySpeed', function(data) {
    commaKeySpeed = data.commaKeySpeed || 2;
  }
  );
}

document.addEventListener("DOMContentLoaded", function() {
  let observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes) {
        Array.from(mutation.addedNodes).forEach((node) => {
          if (node.tagName === 'VIDEO') {
            init(node);
          }
        });
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
});
indicator = document.createElement('div');




function addIndicator(rate) {
  indicator.innerText = `${rate}x Speed${rate === 16 ? ' (max)' : ''}`;
  indicator.style.fontSize = '1.4em';
  indicator.style.fontWeight = 'normal';
  indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.45)';
  indicator.style.display = 'block';
}

function findOriginalSpeed() {
  return new Promise(resolve => {
    const label = Array.from(document.querySelectorAll('.ytp-menuitem-label'))
                      .find(el => el.textContent === 'Playback speed');
    const content = label ? label.nextElementSibling.textContent.toLowerCase() : '1';
    const originalSpeed = content === 'normal' ? '1' : content;
    resolve(originalSpeed);
  });
}


function simulateLeftArrowKeyPress() {
  video.focus();
  const leftArrowKeyCode = 37;
  const downEvent = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      code: 'ArrowLeft',
      keyCode: leftArrowKeyCode,
      which: leftArrowKeyCode,
      bubbles: true,
      cancelable: true
  });
  video.dispatchEvent(downEvent);

  const upEvent = new KeyboardEvent('keyup', {
    key: 'ArrowLeft',
    code: 'ArrowLeft',
    keyCode: leftArrowKeyCode,
    which: leftArrowKeyCode,
    bubbles: true,
    cancelable: true
  });
video.dispatchEvent(upEvent);
}


function newSpeed(rate) {
  video.playbackRate = rate;
  indicator.innerText = `${rate}x Speed`;
  clearInterval(rewindInterval);
  rewindInterval = null;
  firstRewind = true;
}


function init(videoElement) {
  syncSpeeds();
  video = videoElement;

  // remove the original 2x speed overlay - we will be replacing it with our own overlay to avoid confusion
  const overlay = document.querySelector('.ytp-speedmaster-overlay.ytp-overlay');
  overlay?.remove();
  // remove pause overlay for embedded videos as it causes incosistent pausing behavior
  const pauseOverlay = document.querySelector('.ytp-pause-overlay');
  pauseOverlay?.remove();

  video = document.querySelector('video');

  if (lastVideoElement !== video && video !== null) {

    indicator.classList.add('indicator');
    video.parentElement.appendChild(indicator);
    const moviePlayer = videoElement.closest('#movie_player');
  
    if (moviePlayer) {
      moviePlayer.addEventListener('mousedown', mousedownHandler.bind(null, moviePlayer), true);
      moviePlayer.addEventListener('mouseup', mouseupHandler.bind(null, moviePlayer), true);
      moviePlayer.addEventListener('click', clickHandler.bind(null, moviePlayer), true);

      moviePlayer.addEventListener('keydown', function (e) {
        if (e.key === '.') {
          let currentTime = Date.now();
          let timeDifference = currentTime - lastPeriodKeyReleaseTime;
      
          if (timeDifference < 400) {
            doubleTapAndHoldPeriod = true;
          }

          // double tap and hold period will give us double speed, up to max of 16x
          if (doubleTapAndHoldPeriod) {
            isPeriodKeyDown = true;
            video.playbackRate = Math.min(periodKeySpeed * 2, 16);
            addIndicator(Math.min(periodKeySpeed * 2, 16));
          } else {
            video.playbackRate = periodKeySpeed;
            addIndicator(periodKeySpeed);
          }

        } else if (e.key === ',') {
          let currentTime = Date.now();
          let timeDifference = currentTime - lastCommaKeyReleaseTime;
      
          if (timeDifference < 400) {
            doubleTapAndHoldComma = true;
          }
          // double tap and hold comma will give us 0.75x speed
          if (doubleTapAndHoldComma) {
            isCommaKeyDown = true;
            video.playbackRate = 0.75;
            addIndicator(0.75);
          } else {
            video.playbackRate = commaKeySpeed;
            addIndicator(commaKeySpeed);
          }
        }
      });
      
      moviePlayer.addEventListener('keyup', function (e) {
        if (e.key === '.') {
          doubleTapAndHoldPeriod = false;
          lastPeriodKeyReleaseTime = Date.now();
          isPeriodKeyDown = false;
          indicator.style.display = 'none';
          if (!isPeriodKeyDown) {
            video.playbackRate = 1;
          }
        }
        if (e.key === ',') {
          doubleTapAndHoldComma = false;
          lastCommaKeyReleaseTime = Date.now();
          isCommaKeyDown = false;
          indicator.style.display = 'none';
          if (!isCommaKeyDown) {
            video.playbackRate = 1;
          }
        }
      });

    }
  }
} // End init




// MOUSE DOWN HANDLER
function mousedownHandler(moviePlayer, e) {
  initialX = e.clientX;
  initialY = e.clientY;
  setPersistentSpeed = false;

  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  if (elements.some(el => el.classList.contains(chromeControls))) { return; }
    
    longPressTimer = setTimeout(async () => {
      if (!speedPersisting) {
        originalSpeed = await findOriginalSpeed();
      }
      video.playbackRate = mainSpeed;
      addIndicator(mainSpeed);
      longPressFlag = true;
      moviePlayer.addEventListener('mousemove', handleMouseMove.bind(null, moviePlayer), true);
    }, 220);
}


// MOUSE UP HANDLER
function mouseupHandler(moviePlayer, e) {
  moviePlayer.removeEventListener('mousemove', handleMouseMove, true);
  firstRewind = true;

  clearInterval(rewindInterval);
  rewindInterval = null;
  clearTimeout(longPressTimer);
  deltax = 0;
  deltay = 0;

  if (setPersistentSpeed) {
    setTimeout(() => {
      indicator.style.display = 'none';
    }, 1250);
  } else {
    indicator.style.display = 'none';
  }
}


// CLICK HANDLER
function clickHandler(moviePlayer, e) {
  clearInterval(rewindInterval);
  rewindInterval = null;

  if (longPressFlag) {

    if (speedPersisting && !setPersistentSpeed) {
      video.playbackRate = originalSpeed;
      speedPersisting = false;

    } else if (setPersistentSpeed) {
      video.playbackRate = newPersistentSpeed;
      speedPersisting = true;
    } else {
      video.playbackRate = originalSpeed;
      speedPersisting = false;
    }

    longPressFlag = false;
    e.stopPropagation();
    e.preventDefault();
  }
}


// MOUSE MOVE HANDLER
function handleMouseMove(moviePlayer, e) {
  if (!longPressFlag) return;
  const deltaX = e.clientX - initialX;
  const deltaY = e.clientY - initialY;

  // X Axis will set the speed
  if (deltaX > tier2) {
    newSpeed(maxSpeed);
  } else if (deltaX > tier1 && deltaX < tier2) {
    newSpeed(fastSpeed);
  } else if (deltaX < -tier3) {
    indicator.innerText = `REWIND`;
    if (firstRewind) {
      firstRewind = false;
      simulateLeftArrowKeyPress();
    }
    if (!rewindInterval) {
      rewindInterval = setInterval(() => {
        simulateLeftArrowKeyPress();
      }, 800);
    }
  } else if (deltaX < -tier2) {
    newSpeed(minSpeed);
  } else if (deltaX < -tier1) {
    newSpeed(slowSpeed);
  } else {
    newSpeed(mainSpeed);
  }

  // Y Axis will decide if speed is persistent after releasing click
  if (deltaY > verticalTier || deltaY < -verticalTier) {
    setPersistentSpeed = true;
    newPersistentSpeed = video.playbackRate;
    indicator.style.fontWeight = 'bold';
    indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  } else {
    setPersistentSpeed = false;
    indicator.style.fontWeight = 'normal';
    indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.45)';
  }
}



// Give late scripts time to load
setTimeout(() => {
  const videoElement = document.querySelector('video');
  if (videoElement) {
    init(videoElement);
  }
}, 400);