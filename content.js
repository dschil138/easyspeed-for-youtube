let video;
let originalSpeed = 1;
let longPressTimer;
let longPressFlag = false;
let lastVideoElement = null;
let indicator;
let initialX;
let initialY;
let minSpeed = 1.2;
let slowSpeed = 1.5;
let mainSpeed = 2;
let fastSpeed = 3;
let maxSpeed = 5;
let setPersistentSpeed = false;
let newPersistentSpeed;
let speedPersisting = false;
const tier1 = 42;
const tier2 = 140;
const verticalTier = 62;



chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "runInit") {
      syncSpeeds();
    }
  }
);


function syncSpeeds() {
  chrome.storage.sync.get('minSpeed', function(data) {
    minSpeed = data.minSpeed || 1.2;
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




function init(videoElement) {

  syncSpeeds();
  video = videoElement;

  // remove the original overlay - we will be replacing it with our own overlay to avoid confusion
  const overlay = document.querySelector('.ytp-speedmaster-overlay.ytp-overlay');
  overlay?.remove();

  video = document.querySelector('video');

  if (lastVideoElement !== video && video !== null) {

    indicator = document.createElement('div');
    indicator.classList.add('indicator');
    video.parentElement.appendChild(indicator);


    video.addEventListener('mousedown', (e) => {

      initialX = e.clientX;
      initialY = e.clientY;
      setPersistentSpeed = false;
        
        longPressTimer = setTimeout(() => {
          if (!speedPersisting) {
            originalSpeed = video.playbackRate;
          }
          video.playbackRate = mainSpeed;
          indicator.innerText = `${mainSpeed}x Speed`;
          indicator.style.fontSize = '1.4em';
          indicator.style.fontWeight = 'normal';
          indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.35)';
          indicator.style.display = 'block';

          longPressFlag = true;

          video.addEventListener('mousemove', handleMouseMove, true);
        }, 220);
    }, true);



    video.addEventListener('mouseup', (e) => {
      clearTimeout(longPressTimer);
      deltax = 0;
      deltay = 0;

      if (setPersistentSpeed) {
        setTimeout(() => {
          indicator.style.display = 'none';
        }, 1500);
      } else {
        indicator.style.display = 'none';
      }

      if (longPressFlag) {
        e.stopPropagation();
        e.preventDefault();
        if (speedPersisting && !setPersistentSpeed) {
          video.playbackRate = originalSpeed;
        } else if (setPersistentSpeed) {
          video.playbackRate = newPersistentSpeed;
          speedPersisting = true;
        } else {
          video.playbackRate = originalSpeed;
        }
      }
      video.removeEventListener('mousemove', handleMouseMove, true);

    }, true);


    video.addEventListener('click', (e) => {

      if (longPressFlag) {
        e.stopPropagation();
        e.preventDefault();
        longPressFlag = false;
        
      }
    }, true);
  }
} // End init



function newSpeed(rate) {
  video.playbackRate = rate;
  indicator.innerText = `${rate}x Speed`;
}


function handleMouseMove(e) {
  if (!longPressFlag) return;
  const deltaX = e.clientX - initialX;
  const deltaY = e.clientY - initialY;

  // X Axis will set the speed
  if (deltaX > tier2) {
    newSpeed(maxSpeed);
  } else if (deltaX > tier1 && deltaX < tier2) {
    newSpeed(fastSpeed);
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
    indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.45)';

  } else {
    setPersistentSpeed = false;
    indicator.style.fontWeight = 'normal';
    indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.35)';
  }

}


// Give late scripts time to load
setTimeout(() => {
  const videoElement = document.querySelector('video');
  if (videoElement) {
    init(videoElement);
  }
}, 800);

