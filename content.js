let video;
let originalSpeed;
let longPressTimer;
let longPressFlag = false;
let lastVideoElement = null;
let indicator;
let playbackSpeed = 2; // Default/Start

function init() {
  // Fetch setting from chrome storage 
  // hast to run at the start of each init 
  chrome.storage.sync.get('speed', function(data) {
    playbackSpeed = parseFloat(data.speed) || 2;
  });

  video = document.querySelector('video');
  
  if (lastVideoElement !== video && video !== null) {
    lastVideoElement = video;
    
    indicator = document.createElement('div');
    indicator.innerText = `${playbackSpeed}x Speed`;
    indicator.style.position = 'absolute';
    indicator.style.top = '40px';
    indicator.style.right = 'calc(50% - 50px)';
    indicator.style.borderRadius = '10px';
    indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    indicator.style.color = 'white';
    indicator.style.padding = '8px';
    indicator.style.zIndex = '1000';
    indicator.style.display = 'none';
    
    video.parentElement.appendChild(indicator);

    video.addEventListener('mousedown', (e) => {
        originalSpeed = video.playbackRate;
        longPressTimer = setTimeout(() => {
          video.playbackRate = playbackSpeed;
          indicator.innerText = `${playbackSpeed}x Speed`;
          longPressFlag = true;
          indicator.style.display = 'block';
        }, 250);
    }, true);

    video.addEventListener('mouseup', (e) => {
      clearTimeout(longPressTimer);
      video.playbackRate = originalSpeed;
      indicator.style.display = 'none';
    
      if (longPressFlag) {
        longPressFlag = false;
    
        // Fix auto pause by immediately hitting play with spacebar
        setTimeout(() => {
          const spaceBarEvent = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            keyCode: 32 
          });
          document.dispatchEvent(spaceBarEvent);
        }, 10); //10 ms
      }
    }, true);

    video.addEventListener('pause', (e) => {
      if (longPressFlag) {
        video.play();  
      }
    }, true);
  }
}

// Call it every 2 seconds
setInterval(init, 2000);
