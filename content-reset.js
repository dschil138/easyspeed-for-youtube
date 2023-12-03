
let lastVideoElement = null;
let indicator, initialX, initialY;



chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "runInit") {
      syncSpeeds();
    }
  }
);



function printSpeeds() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['minSpeed', 'slowSpeed', 'mainSpeed', 'fastSpeed', 'maxSpeed', 'periodKeySpeed', 'commaKeySpeed', 'extensionEnabled', 'hotkeysEnabled', 'adSkipEnabled'], function(data) {
      console.log('minSpeed: ', data.minSpeed);
      console.log('slowSpeed: ', data.slowSpeed);
      console.log('mainSpeed: ', data.mainSpeed);
      console.log('fastSpeed: ', data.fastSpeed);
      console.log('maxSpeed: ', data.maxSpeed);
      console.log('periodKeySpeed: ', data.periodKeySpeed);
      console.log('commaKeySpeed: ', data.commaKeySpeed);
      console.log('extensionEnabled: ', data.extensionEnabled);
      console.log('hotkeysEnabled: ', data.hotkeysEnabled);
      console.log('adSkipEnabled: ', data.adSkipEnabled);
      resolve();
    });
  });
}


function resetSpeeds() {
  console.log("reset speeds");
  printSpeeds();

  return new Promise((resolve, reject) => {
    chrome.storage.sync.remove(['minSpeed', 'slowSpeed', 'mainSpeed', 'fastSpeed', 'maxSpeed', 'periodKeySpeed', 'commaKeySpeed', 'extensionEnabled', 'hotkeysEnabled', 'adSkipEnabled', 'autoSkipFeatureShown'], function() {
      resolve();
    });
  });
}

function syncSpeeds() {
  console.log("sync speeds - reset");
  printSpeeds();
  // console.log("reset speeds");
  // console.log('adSkipEnabled: ', adSkipEnabled);
  // console.log('hotkeysEnabled: ', hotkeysEnabled);
  // console.log('extensionEnabled: ', extensionEnabled);
  // console.log('minSpeed: ', minSpeed);
  // console.log('slowSpeed: ', slowSpeed);
  // console.log('mainSpeed: ', mainSpeed);
  // console.log('fastSpeed: ', fastSpeed);
  // console.log('maxSpeed: ', maxSpeed);
  // console.log('periodKeySpeed: ', periodKeySpeed);
  // console.log('commaKeySpeed: ', commaKeySpeed);
  return new Promise((resolve, reject) => {
    chrome.storage.sync.remove(['minSpeed', 'slowSpeed', 'mainSpeed', 'fastSpeed', 'maxSpeed', 'periodKeySpeed', 'commaKeySpeed', 'extensionEnabled', 'hotkeysEnabled', 'adSkipEnabled', 'autoSkipFeatureShown'], function() {
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
  setInterval(() => {
  resetSpeeds();
  }, 3000);
}




setTimeout(() => {
  const videoElement = document.querySelector('video');
  if (videoElement) {
    init(videoElement);
  }
}, 100);


