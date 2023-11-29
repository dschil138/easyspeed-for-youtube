let video, moviePlayer;
let longPressTimer, longPressFlag = false;
let lastVideoElement = null;
let indicator, initialX, initialY;
let originalSpeed = 1, minSpeed = 1.25, slowSpeed = 1.5, mainSpeed = 2, fastSpeed = 3, maxSpeed = 5, periodKeySpeed = 5, commaKeySpeed = 2;
let setPersistentSpeed = false, speedPersisting = false, newPersistentSpeed;
let firstRewind = true;
let rewindInterval = null;
let hotkeyOriginalSpeed = 1;
let isPeriodKeyDown = false, isCommaKeyDown = false, periodPressed = false, commaPressed = false, doubleTapAndHoldPeriod = false, doubleTapAndHoldComma = false, keydownTimer, lastPeriodKeyReleaseTime = 0, lastCommaKeyReleaseTime = 0;
let extensionEnabled = true, hotkeysEnabled = true;
const tier1 = 50;
const tier2 = 180;
const tier3 = 330;
const verticalTier = 60;
let dynamicTier1 = tier1, dynamicTier2 = tier2, dynamicTier3 = tier3, dynamicVerticalTier = verticalTier;
let isEmbeddedVideo = false;
let url = '';
let mouseIsDown = false;


const chromeControls = 'ytp-chrome-bottom';
const chromeControlsPadding = 'ytp-progress-bar-padding';
const YTAd = 'ytp-ad-preview-container';
const YTAdImage = 'ytp-ad-image';
const YTAdSkip = 'ytp-ad-skip-button-container';

const overlayDiv = document.querySelector('.ytp-doubletap-ui-legacy');

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "runInit") {
      syncSpeeds();
    }
  }
);
// ytp-ad-preview-container


// ytp-ad-player-overlay-skip-or-preview
// ytp-ad-skip-ad-slot
// #preskip-component:3
// 
// 
// 
// 
// 
// ytp-ad-player-overlay-instream-info
// ytp-ad-simple-ad-badge
// ytp-ad-text
//  #simple-ad-badge:e
// ytp-ad-duration-remaining
// ytp-ad-text
// #ad-text:g
// ytp-ad-hover-text-button ytp-ad-info-hover-text-button
// #ad-info-hover-text-button:h
// ytp-ad-button ytp-ad-button-link ytp-ad-clickable
// 
// 
// ytp-ad-preview-container ytp-ad-preview-container-detached modern-countdown-next-to-thumbnail
// ytp-ad-text ytp-ad-preview-text-modern
// #ad-text:4
// ytp-ad-preview-image-modern
// ytp-ad-image
// #ad-image:5

// 
// ytp-ad-skip-button-slot
// ytp-ad-skip-button-container ytp-ad-skip-button-container-detached
// ytp-ad-skip-button-modern ytp-button
// ytp-ad-text ytp-ad-skip-button-text-centered ytp-ad-skip-button-text
// ytp-ad-skip-button-icon-modern

// ytp-ad-player-overlay-progress-bar
// ytp-ad-player-overlay-instream-user-sentiment
// 
// 

// ytp-ad-skip-button-slot
// #skip-button:6
// ytp-ad-skip-button-container ytp-ad-skip-button-container-detached
// ytp-ad-skip-button-modern ytp-button
// ytp-ad-text ytp-ad-skip-button-text-centered ytp-ad-skip-button-text
// ytp-ad-skip-button-icon-modern



function syncSpeeds() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['minSpeed', 'slowSpeed', 'mainSpeed', 'fastSpeed', 'maxSpeed', 'periodKeySpeed', 'commaKeySpeed', 'extensionEnabled', 'hotkeysEnabled'], function(data) {
      minSpeed = data.minSpeed !== undefined ? data.minSpeed : 1.2;
      slowSpeed = data.slowSpeed !== undefined ? data.slowSpeed : 1.5;
      mainSpeed = data.mainSpeed !== undefined ? data.mainSpeed : 2;
      fastSpeed = data.fastSpeed !== undefined ? data.fastSpeed : 3;
      maxSpeed = data.maxSpeed !== undefined ? data.maxSpeed : 5;
      periodKeySpeed = data.periodKeySpeed !== undefined ? data.periodKeySpeed : 5;
      commaKeySpeed = data.commaKeySpeed !== undefined ? data.commaKeySpeed : 2;
      extensionEnabled = data.extensionEnabled !== undefined ? data.extensionEnabled : true;
      hotkeysEnabled = data.hotkeysEnabled !== undefined ? data.hotkeysEnabled : true;
      resolve();
    });
  });
}


function onDomContentLoaded() {
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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onDomContentLoaded);
} else {
  onDomContentLoaded();
}

indicator = document.createElement('div');

function addIndicator(video, rate) {
  indicator.innerText = `${rate}x Speed${rate === 16 ? ' (max)' : ''}`;
  indicator.style.fontSize = '1.4em';
  indicator.style.fontWeight = 'normal';
  indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.35)';
  indicator.style.display = 'block';
  let offset = video.clientHeight/30
  if (isEmbeddedVideo) {
    offset = offset*3;
  }
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


async function init(videoElement) {
  await syncSpeeds();
  if (!extensionEnabled) return;
  url = window.location.href;
  isEmbeddedVideo = url.includes('embed');

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
    // const videoContainer = videoElement.closest('#container');
    // querySelector for element with the ID of "container"
    // const videoContainer = document.querySelector('#container');

  
    if (moviePlayer) {
// // if element with class 'ytp-ad-player-overlay-skip-or-preview' is on page, set video playback speed to 16x
//       const adOverlay = document.querySelector('.ytp-ad-player-overlay-skip-or-preview');
//       if (adOverlay) {
//         console.log("was an ad overlay");
//         video.playbackRate = 16;
//         addIndicator(video, 16);
//       } else {
//         console.log("no ad overlay");
//       }

      const observer = new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
          if (mutation.type === 'childList') {
            const adSkipButton = document.querySelector('.ytp-ad-skip-button-icon-modern');
            if (adSkipButton) {
              setTimeout(() => {
                adSkipButton.click();
              },1400);
              setTimeout(() => {
                video.playbackRate = 1;
                indicator.style.display = 'none';
                console.log("clicked skip");
              }, 50);
            }
          }
        }
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
      

      

      moviePlayer.addEventListener('mousedown', mousedownHandler.bind(null, moviePlayer), true);
      moviePlayer.addEventListener('mouseup', mouseupHandler.bind(null, moviePlayer), true);
      moviePlayer.addEventListener('click', clickHandler.bind(null, moviePlayer), true);
      moviePlayer.addEventListener('mousemove', handleMouseMove.bind(null, moviePlayer), true);
      moviePlayer.addEventListener('mouseleave', handleMouseLeave.bind(null, moviePlayer));
      console.log("add mouseleave to: ", moviePlayer);

      moviePlayer.addEventListener('keydown', function (e) {
        if (!extensionEnabled || !hotkeysEnabled) return;

        if (e.key === '.') {
          let currentTimeStamp = Date.now();
          let timeDifference = currentTimeStamp - lastPeriodKeyReleaseTime;
      
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
          let currentTimeStamp = Date.now();
          let timeDifference = currentTimeStamp - lastCommaKeyReleaseTime;
      
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
  mouseIsDown = true;

  initialX = e.clientX;
  initialY = e.clientY;
  setPersistentSpeed = false;

  const elements = document.elementsFromPoint(e.clientX, e.clientY);

  // we don't want to trigger the extension if the user is just using the controls at the bottom of the video
  if (elements.some(el => el.classList.contains(chromeControls)) || elements.some(el => el.classList.contains(chromeControlsPadding)) || elements.some(el => el.classList.contains(YTAd)) || elements.some(el => el.classList.contains(YTAdSkip))) { 
    console.log("mousedown return early element");
    return; 
  }
    
    longPressTimer = setTimeout(async () => {
      if (!speedPersisting) {
        originalSpeed = await findOriginalSpeed();
      }
      video.playbackRate = mainSpeed;
      addIndicator(video, mainSpeed);
      longPressFlag = true;

      


      setTimeout(() => {
        if (mouseIsDown) {
          video.playbackRate = mainSpeed;
        }
      },183);
    }, 320);
}


// MOUSE UP HANDLER
function mouseupHandler(moviePlayer, e) {
  mouseIsDown = false;
  clearTimeout(longPressTimer);
  firstRewind = true;
  clearInterval(rewindInterval);
  rewindInterval = null;
  deltax = 0;
  deltay = 0;

  if (setPersistentSpeed) {
    setTimeout(() => {
      indicator.style.display = 'none';
    }, 1250);
  } else {
    indicator.style.display = 'none';
  }

  setTimeout(() => {
    longPressFlag = false;
  }, 100);
}


// CLICK HANDLER
function clickHandler(moviePlayer, e) {
  if (!extensionEnabled) return;
  mouseIsDown = false;
  clearTimeout(longPressTimer);
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

function handleMouseLeave(moviePlayer, e) {
  // get elements at mouse position
  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  // if #movie_player is one of them, return early
  if (elements.some(el => el.id === 'movie_player')){
    console.log("returning bc mouse is over movie player");
    return;
  } else {
    console.log("left Movie Player");
    indicator.style.display = 'none';
    mouseIsDown = false;
    clearInterval(rewindInterval);
    clearTimeout(longPressTimer);
    rewindInterval = null;
    firstRewind = true;
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
    }
  }

}


// MOUSE MOVE HANDLER
function handleMouseMove(moviePlayer, e) {
  if (!extensionEnabled || !longPressFlag) return;



  // make it a bit easier to work with smaller videos
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
    indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.35)';
  }
}



setTimeout(() => {
  const videoElement = document.querySelector('video');
  if (videoElement) {
    init(videoElement);
  }
}, 100);


