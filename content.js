let video;
let originalSpeed;
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
let tier2 = 160;
let verticalTier = 80;
let setPersistentSpeed = false;
let newPersistentSpeed;
let speedPersisting = false;
let firstRun = true;


function init() {
  // Get any previous settings from chrome storage 
  // hast to run at the start of each init 

  chrome.storage.sync.get('minestSpeed', function(data) {
    minestPlaybackSpeed = parseFloat(data.minestSpeed) || 1.1;
  }
  );


  chrome.storage.sync.get('minSpeed', function(data) {
    minPlaybackSpeed = parseFloat(data.minSpeed) || 1.5;
  }
  );

  chrome.storage.sync.get('speed', function(data) {
    playbackSpeed = parseFloat(data.speed) || 2;
  });


  chrome.storage.sync.get('maxSpeed', function(data) {
    maxPlaybackSpeed = parseFloat(data.maxSpeed) || 3;
  }
  );

  chrome.storage.sync.get('maxestSpeed', function(data) {
    maxestPlaybackSpeed = parseFloat(data.maxestSpeed) || 5;
  }
  );

  // if (firstRun) {
  //   originalSpeed = parseFloat(video.playbackRate);
  //   firstRun = false;
  // }

  // remove the original overlay
  // we will be replacing it with our own overlay, to avoid confusion
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
    indicator.style.top = '40px';
    indicator.style.right = 'calc(50% - 50px)';
    indicator.style.borderRadius = '11px';
    indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    indicator.style.color = 'white';
    indicator.style.padding = '8px';
    indicator.style.paddingLeft = '13px';
    indicator.style.paddingRight = '13px';
    indicator.style.zIndex = '1000';
    indicator.style.display = 'none';
    
    video.parentElement.appendChild(indicator);


    // Mouse Down
    video.addEventListener('mousedown', (e) => {
      // if (!speedPersisting) {
      //   originalSpeed = parseFloat(video.playbackRate);
      // }

      initialX = e.clientX;
      initialY = e.clientY;

      setPersistentSpeed = false;

        
        longPressTimer = setTimeout(() => {
          if (!speedPersisting) {
            originalSpeed = parseFloat(video.playbackRate);
          }

          video.playbackRate = playbackSpeed;
          indicator.innerText = `${playbackSpeed}x Speed`;
          indicator.style.fontWeight = 'normal';
          indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';

          longPressFlag = true;
          indicator.style.display = 'block';

          video.addEventListener('mousemove', handleMouseMove, true);

        }, 180);
    }, true);


    // Mouse Up
    video.addEventListener('mouseup', (e) => {
      clearTimeout(longPressTimer);
      // video.playbackRate = originalSpeed;
      deltax = 0;
      deltay = 0;

      if (setPersistentSpeed) {
        setTimeout(() => {
          indicator.style.display = 'none';
        }, 1800);
      } else {
        indicator.style.display = 'none';
        // speedPersisting = false;
      }
      video.removeEventListener('mousemove', handleMouseMove, true);
    
      if (longPressFlag) {
        longPressFlag = false;
    
        setTimeout(() => {
          // prevents odd double pause/play behavior
        }, 10);
      }
    }, true);


    // video.addEventListener('pause', (e) => {
    //   setPersistentSpeed = false;
    //   newPersistentSpeed = originalSpeed;
    //   speedPersisting = false;
    //   indicator.style.fontWeight = 'normal';
    //   indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';

    //   if (longPressFlag) {
    //     video.play();  
    //   }

    // }, true);


    video.addEventListener('click', (e) => {
      if (speedPersisting) {
        console.log('IF - originalSpeed: ', originalSpeed);
        video.playbackRate = originalSpeed;
        speedPersisting = false;
      } 

      else if (setPersistentSpeed) {
        console.log('ELSE IF - newPersistentSpeed: ', newPersistentSpeed);
        video.playbackRate = newPersistentSpeed;
        speedPersisting = true;
      } 

      else {
        console.log('last ELSE - originatlSpeed: ', originalSpeed);
        video.playbackRate = originalSpeed;
        speedPersisting = false;

      }

    }, true);


  } // End of if statement

  

  console.log('speedPersisting: ', speedPersisting);


} // End of init function


function handleMouseMove(e) {
  if (!longPressFlag) return;
  const deltaX = e.clientX - initialX;
  const deltaY = e.clientY - initialY;

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

  if (deltaY > verticalTier || deltaY < -verticalTier) {
    setPersistentSpeed = true;
    newPersistentSpeed = video.playbackRate;
    indicator.style.fontWeight = 'bold';
    indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';

  }

}


// Call it every 500 ms
setInterval(init, 2000);
