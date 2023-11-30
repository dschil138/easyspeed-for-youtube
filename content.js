
let lastVideoElement = null;
let indicator, initialX, initialY;
const isDebugMode = false;


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "runInit") {
      syncSpeeds();
    }
  }
);


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

    if (moviePlayer) {
      moviePlayer.addEventListener('mousedown', mousedownHandler.bind(null, moviePlayer), true);
      moviePlayer.addEventListener('mouseup', mouseupHandler.bind(null, moviePlayer), true);
      moviePlayer.addEventListener('click', clickHandler.bind(null, moviePlayer), true);
      moviePlayer.addEventListener('mousemove', handleMouseMove.bind(null, moviePlayer), true);
      moviePlayer.addEventListener('mouseleave', handleMouseLeave.bind(null, moviePlayer));

      moviePlayer.addEventListener('keydown', keydownHandler);
      moviePlayer.addEventListener('keyup', keyupHandler);
    }
  }
}



setTimeout(() => {
  const videoElement = document.querySelector('video');
  if (videoElement) {
    init(videoElement);
  }
}, 100);


