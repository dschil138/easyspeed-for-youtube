
let lastVideoElement = null;
let indicator, initialX, initialY;

const isDebugMode = false;


// if (window.location.hostname.includes("youtube.com")) {
//   // Check if the popup should be shown
//   chrome.storage.local.get(['autoSkipFeatureShown'], function(result) {
//       if (!result.autoSkipFeatureShown) {
//           // Inject the HTML for the popup
//           var popupHTML = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>New Feature Alert</title><link rel="stylesheet" href="featurePopup.css"></head><body><div id="popup-container"><div id="popup-content"><h1>New Feature: AutoSkip</h1><p>Automatically skip to the best parts of a video. Try it now!</p><button id="close-btn">Got it!</button></div></div><script src="featurePopup.js"></script></body></html>'; // Your Popup HTML here
//           document.body.insertAdjacentHTML('beforeend', popupHTML);

//           // Add your CSS here or ensure it's injected via manifest.json

//           // Add event listener for the close button
//           var closeButton = document.getElementById('close-btn');
//           closeButton.addEventListener('click', function() {
//               var popupContainer = document.getElementById('popup-container');
//               popupContainer.style.display = 'none';

//               // Update the storage
//               chrome.storage.local.set({autoSkipFeatureShown: true});
//           });

//           // Show the popup
//           document.getElementById('popup-container').style.display = 'block';
//       }
//   });
// }


if (window.location.hostname.includes("youtube.com")) {
  console.log("youtube.com");
  chrome.storage.local.get(['autoSkipFeatureShown'], function(result) {
      if (!result.autoSkipFeatureShown) {
        console.log("normally not show popup now bc user has seen it already");
      }

      // Inject the HTML for the popup
      var popupHTML = '<div id="popup-container"><div id="popup-content"><div style="font-size: 12px; padding-bottom: 0.2em; margin-bottom: 0.2em;">New Feature:</div><h1>Auto-Skip Ads</h1><p>Auto fast-forward through ads, and auto-click the "Skip" button with <b>Easy Speed Drag</b>\'s new <b>Auto-Skip</b> feature.</p><p>Use the toggle switch below to enable, or change any time in the extension settings.</p> <div class="switch-container"><label for="adSkipToggleSwitch">Auto-Skip Ads:</label><label class="switch"><input type="checkbox" id="adSkipToggleSwitch"><span class="slider round"></span></label></div><button id="close-btn">Done</button></div></div>';
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
          console.log("adSkip: ", this.checked);
          init();
      });
  
      // Check if the popup should be shown
      chrome.storage.local.get(['autoSkipFeatureShown'], function (result) {
          if (!result.autoSkipFeatureShown) {
              // Show the popup
              popupContainer.style.display = 'block';
          }
      });
  
      // Close button event listener
      closeButton.addEventListener('click', function () {
          popupContainer.style.display = 'none';
          // Update the storage to not show the popup again
          chrome.storage.local.set({ autoSkipFeatureShown: true }, function () {
              console.log('The user has been informed about the AutoSkip feature.');
          });
      });

      // Add event listener for the close button
      var closeButton = document.getElementById('close-btn');
      closeButton.addEventListener('click', function() {
          var popupContainer = document.getElementById('popup-container');
          popupContainer.style.display = 'none';
          // Update the storage
          chrome.storage.local.set({autoSkipFeatureShown: true});
      });

      // Show the popup
      document.getElementById('popup-container').style.display = 'block';
  });
}




chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "runInit") {
      syncSpeeds();
    }
  }
);




function syncSpeeds() {
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
  console.log("init");
  await syncSpeeds();
  if (!extensionEnabled) return;

  console.log("adSkip: ", adSkipEnabled);

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


