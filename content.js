
let lastVideoElement = null;
let indicator, initialX, initialY;
// const isDebugMode = true;

// function log(...args) {
//   if (isDebugMode) {
//       console.log(...args);
//   }
// }

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "runInit") {
      syncSpeeds();
    }
  }
);


if (window.location.hostname.includes("youtube.com")) {
    log("youtube.com");
    if (!window.location.href.includes("embed")) {  // don't show on embedded videos
    log("not embed");
    chrome.storage.sync.get(['autoSkipFeatureShown'], function(result) {
      if (!result.autoSkipFeatureShown) { //don't show if the user has already seen the popup
        chrome.storage.sync.get(['extensionEnabled'], function(data) {
          if (data.extensionEnabled !== false) { //don't show if the extension is disabled
            log("extension enabled");

            // If passed all those checks, inject the HTML for the popup
            var popupHTML = '<div id="popup-container"><div id="popup-content"><div style="font-size: 12px; padding-bottom: 0.2em; margin-bottom: 0.2em;">New Feature:</div><h1>Auto-Skip Ads</h1><p>Auto fast-forward through ads, and auto-click the "Skip" button with <b>Easy Speed Drag</b>\'s new <b>Auto-Skip</b> feature.</p><p>Change setting with the toggle switch below, or at any time in the extension settings.</p> <div class="switch-container"><label for="adSkipToggleSwitch">Auto-Skip Ads:</label><label class="switch"><input type="checkbox" id="adSkipToggleSwitch"><span class="slider round"></span></label></div><button id="close-btn">Done</button></div></div>';
            document.body.insertAdjacentHTML('beforeend', popupHTML);

            var closeButton = document.getElementById('close-btn');
            var popupContainer = document.getElementById('popup-container');
            const adSkipToggleSwitch = document.getElementById('adSkipToggleSwitch');
        
            chrome.storage.sync.get(['adSkipEnabled'], function (data) {
                adSkipToggleSwitch.checked = data.adSkipEnabled !== undefined ? data.adSkipEnabled : true;
            });
        
            adSkipToggleSwitch.addEventListener('input', function () {
                chrome.storage.sync.set({ 'adSkipEnabled': this.checked }, function () {
                });
                log("adSkip: ", this.checked);
                init();
            });

            popupContainer.style.display = 'block';
        
            // Close button event listener
            closeButton.addEventListener('click', function () {
                popupContainer.style.display = 'none';
                // Update the storage to not show the popup again
                chrome.storage.sync.set({ autoSkipFeatureShown: true }, function () {
                    log('The user has been informed about the AutoSkip feature.');
                });
            });

            // Add event listener for the close button
            var closeButton = document.getElementById('close-btn');
            closeButton.addEventListener('click', function() {
                var popupContainer = document.getElementById('popup-container');
                popupContainer.style.display = 'none';
                // Update the storage
                chrome.storage.sync.set({autoSkipFeatureShown: true});
            });

            // Show the popup
            document.getElementById('popup-container').style.display = 'block';
          }
        });

      }
    });

  }

}







function syncSpeeds() {
  log("sync speeds");
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['minSpeed', 'slowSpeed', 'mainSpeed', 'fastSpeed', 'maxSpeed', 'periodKeySpeed', 'commaKeySpeed', 'extensionEnabled', 'hotkeysEnabled', 'adSkipEnabled'], function(data) {
      minSpeed = data.minSpeed !== undefined ? data.minSpeed : 1.2;
      slowSpeed = data.slowSpeed !== undefined ? data.slowSpeed : 1.5;
      mainSpeed = data.mainSpeed !== undefined ? data.mainSpeed : 2;
      fastSpeed = data.fastSpeed !== undefined ? data.fastSpeed : 3;
      maxSpeed = data.maxSpeed !== undefined ? data.maxSpeed : 5;
      periodKeySpeed = data.periodKeySpeed !== undefined ? data.periodKeySpeed : 5;
      commaKeySpeed = data.commaKeySpeed !== undefined ? data.commaKeySpeed : 2;
      extensionEnabled = data.extensionEnabled !== undefined ? data.extensionEnabled : true;
      hotkeysEnabled = data.hotkeysEnabled !== undefined ? data.hotkeysEnabled : true;
      adSkipEnabled = data.adSkipEnabled !== undefined ? data.adSkipEnabled : true;
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
  log("init");
  await syncSpeeds();
  if (!extensionEnabled) return;

  log("adSkip: ", adSkipEnabled);

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
    const moviePlayer = document.querySelector('#movie_player');

    if (moviePlayer) {
      overlayObserver.observe(document.body, { childList: true, subtree: true });
      buttonObserver.observe(document.body, { childList: true, subtree: true });

      moviePlayer.addEventListener('mousedown', mousedownHandler.bind(null, moviePlayer), true);
      moviePlayer.addEventListener('mouseup', mouseupHandler.bind(null, moviePlayer), true);
      moviePlayer.addEventListener('click', clickHandler.bind(null, moviePlayer), true);
      moviePlayer.addEventListener('mousemove', handleMouseMove.bind(null, moviePlayer), true);
      moviePlayer.addEventListener('mouseleave', handleMouseLeave.bind(null, moviePlayer));

      moviePlayer.addEventListener('keydown', keydownHandler);
      moviePlayer.addEventListener('keyup', keyupHandler);
    }
  }
} // End init




setTimeout(() => {
  const videoElement = document.querySelector('video');
  if (videoElement) {
    init(videoElement);
  }
}, 100);


