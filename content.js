let video;
let originalSpeed = 1;
let longPressTimer;
let longPressFlag = false;
let lastVideoElement = null;
let indicator;
let initialX;
let initialY;
let minPlaybackSpeed;
let playbackSpeed;
let maxPlaybackSpeed;
let maxestPlaybackSpeed = 5;
let minestPlaybackSpeed = 1.1;
let tier1 = 42;
let tier2 = 150;
let verticalTier = 80;
let setPersistentSpeed = false;
let newPersistentSpeed;
let speedPersisting = false;
let firstRun = true;
let counter = 0;


function init() {
  // Get any previous settings from chrome storage 
  // hast to run at the start of each init 

  chrome.storage.sync.get('minestSpeed', function(data) {
    minestPlaybackSpeed = parseFloat(data.minestSpeed) || 1.1;
  });
  chrome.storage.sync.get('minSpeed', function(data) {
    minPlaybackSpeed = parseFloat(data.minSpeed) || 1.5;
  });
  chrome.storage.sync.get('speed', function(data) {
    playbackSpeed = parseFloat(data.speed) || 2;
  });
  chrome.storage.sync.get('maxSpeed', function(data) {
    maxPlaybackSpeed = parseFloat(data.maxSpeed) || 3;
  });
  chrome.storage.sync.get('maxestSpeed', function(data) {
    maxestPlaybackSpeed = parseFloat(data.maxestSpeed) || 5;
  });

  // remove the original overlay - we will be replacing it with our own overlay to avoid confusion
  const overlay = document.querySelector('.ytp-speedmaster-overlay.ytp-overlay');
  if (overlay) {
    overlay.remove();
  }


  video = document.querySelector('video');
  
  if (lastVideoElement !== video && video !== null) {
    lastVideoElement = video;
    
    indicator = document.createElement('div');
    indicator.style.fontSize = '1.4em';
    indicator.innerText = `${playbackSpeed}x Speed`;
    indicator.style.position = 'absolute';
    indicator.style.top = '35px';
    indicator.style.right = 'calc(50% - 50px)';
    indicator.style.borderRadius = '11px';
    indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.35)';
    indicator.style.color = 'white';
    indicator.style.padding = '8px';
    indicator.style.paddingLeft = '13px';
    indicator.style.paddingRight = '13px';
    indicator.style.zIndex = '1000';
    indicator.style.display = 'none';
    
    video.parentElement.appendChild(indicator);


    // Mouse Down
    video.addEventListener('mousedown', (e) => {

      initialX = e.clientX;
      initialY = e.clientY;
      setPersistentSpeed = false;
        
        longPressTimer = setTimeout(() => {
          if (!speedPersisting) {
            originalSpeed = parseFloat(video.playbackRate);
          }

          video.playbackRate = playbackSpeed;
          indicator.innerText = `${playbackSpeed}x Speed`;
          indicator.style.fontSize = '1.4em';
          indicator.style.fontWeight = 'normal';
          indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.35)';
          indicator.style.display = 'block';

          longPressFlag = true;

          video.addEventListener('mousemove', handleMouseMove, true);
        }, 220);
    }, true);


    // Mouse Up
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

      video.removeEventListener('mousemove', handleMouseMove, true);

    }, true);




    video.addEventListener('click', (e) => {
      if (longPressFlag) {
        if (speedPersisting && !setPersistentSpeed) {
          video.playbackRate = parseFloat(originalSpeed);
        } 
        else if (setPersistentSpeed) {
          video.playbackRate = newPersistentSpeed;
        }

        longPressFlag = false;
      }
    }, true);

  } // End of if statement


} // End of init function


function handleMouseMove(e) {
  if (!longPressFlag) return;
  const deltaX = e.clientX - initialX;
  const deltaY = e.clientY - initialY;

  // X Axis will set the speed
  if (deltaX > tier2) {
    video.playbackRate = maxestPlaybackSpeed
    indicator.innerText = `${video.playbackRate}x Speed`;
  } else if (deltaX > tier1 && deltaX < tier2) {
    video.playbackRate = maxPlaybackSpeed
    indicator.innerText = `${video.playbackRate}x Speed`;
  } else if (deltaX < -tier2) {
    video.playbackRate = minestPlaybackSpeed
    indicator.innerText = `${video.playbackRate}x Speed`;
  } else if (deltaX < -tier1) {
    video.playbackRate = minPlaybackSpeed
    indicator.innerText = `${video.playbackRate}x Speed`;
  } else {
    video.playbackRate = playbackSpeed;
    indicator.innerText = `${playbackSpeed}x Speed`;
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
if (counter < 6) {
  setTimeout(init, 800);
  counter++;
}
