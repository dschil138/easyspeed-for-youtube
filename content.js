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
let extensionEnabled = true;
let hotkeysEnabled = true;
const tier1 = 50;
const tier2 = 180;
const tier3 = 330;
const verticalTier = 60;
let dynamicTier1 = tier1;
let dynamicTier2 =  tier2;
let dynamicTier3 =  tier3;
let dynamicVerticalTier = verticalTier;




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
  chrome.storage.sync.get('mainSpeed', function(data) {
    mainSpeed = data.mainSpeed || 1.5;
  });
  chrome.storage.sync.get('fastSpeed', function(data) {
    fastSpeed = data.fastSpeed || 3;
  });
  chrome.storage.sync.get('maxSpeed', function(data) {
    maxSpeed = data.maxSpeed || 5;
  });
  chrome.storage.sync.get('periodKeySpeed', function(data) {
    periodKeySpeed = data.periodKeySpeed || 5;
  });
  chrome.storage.sync.get('commaKeySpeed', function(data) {
    commaKeySpeed = data.commaKeySpeed || 2;
  });
  chrome.storage.sync.get('extensionEnabled', function(data) {
    extensionEnabled = data.extensionEnabled;
  });
  chrome.storage.sync.get('hotkeysEnabled', function(data) {
    hotkeysEnabled = data.hotkeysEnabled;
  });
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


function addIndicator(video, rate) {
  indicator.innerText = `${rate}x Speed${rate === 16 ? ' (max)' : ''}`;
  indicator.style.fontSize = '1.4em';
  indicator.style.fontWeight = 'normal';
  indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.45)';
  indicator.style.display = 'block';
  let height = video.clientHeight
  let offset = height/10;
  indicator.style.top = `${offset}px`;
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
  if (!extensionEnabled) return;

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
  if (!extensionEnabled) return;
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
        if (!extensionEnabled || !hotkeysEnabled) return;

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
            addIndicator(video, Math.min(periodKeySpeed * 2, 16));
          } else {
            video.playbackRate = periodKeySpeed;
            addIndicator(video, periodKeySpeed);
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
            addIndicator(video, 0.75);
          } else {
            video.playbackRate = commaKeySpeed;
            addIndicator(video, commaKeySpeed);
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
  if (!extensionEnabled) return;

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
      addIndicator(video, mainSpeed);
      longPressFlag = true;

      moviePlayer.addEventListener('mousemove', handleMouseMove.bind(null, moviePlayer), true);

      setTimeout(() => {
        video.playbackRate = mainSpeed;
      },283);


    }, 220);
}


// MOUSE UP HANDLER
function mouseupHandler(moviePlayer, e) {
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
  if (!extensionEnabled || !longPressFlag) return;
  width = moviePlayer.clientWidth;

  if (width < 450) {
    dynamicTier1 = tier1/1.8;
    dynamicTier2 =  tier2/1.8;
    dynamicTier3 =  tier3/1.8;
    dynamicVerticalTier = verticalTier/1.8;
  } else {
    dynamicTier1 = tier1;
    dynamicTier2 =  tier2;
    dynamicTier3 =  tier3;
    dynamicVerticalTier = verticalTier;
  }

  const deltaX = e.clientX - initialX;
  const deltaY = e.clientY - initialY;

  // X Axis will set the speed
  if (deltaX > dynamicTier2) {
    newSpeed(maxSpeed);
  } else if (deltaX > dynamicTier1 && deltaX < dynamicTier2) {
    newSpeed(fastSpeed);
  } else if (deltaX < -dynamicTier3) {
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
  } else if (deltaX < -dynamicTier2) {
    newSpeed(minSpeed);
  } else if (deltaX < -dynamicTier1) {
    newSpeed(slowSpeed);
  } else {
    newSpeed(mainSpeed);
  }

  // Y Axis will decide if speed is persistent after releasing click
  if (deltaY > dynamicVerticalTier || deltaY < -dynamicVerticalTier) {
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
  if (!extensionEnabled) return;
  const videoElement = document.querySelector('video');
  if (videoElement) {
    init(videoElement);
  }
}, 400);