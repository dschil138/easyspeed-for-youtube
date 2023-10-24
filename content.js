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
let fullMaxPlaybackSpeed = 5;
let fullMinPlaybackSpeed = 1.1;
let tier1 = 42;
let tier2 = 134;
let setPersistentSpeed = false;
let newPersistentSpeed;


function init() {
  // Get any previous settings from chrome storage 
  // hast to run at the start of each init 
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
      originalSpeed = parseFloat(video.playbackRate);

      initialX = e.clientX;
      initialY = e.clientY;

      setPersistentSpeed = false;
      newPersistentSpeed = originalSpeed;

        
        longPressTimer = setTimeout(() => {
          originalSpeed = parseFloat(video.playbackRate);

          video.playbackRate = playbackSpeed;
          indicator.innerText = `${playbackSpeed}x Speed`;
          indicator.style.fontWeight = 'normal';

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
        }, 2000);
      } else {
        indicator.style.display = 'none';
      }
      video.removeEventListener('mousemove', handleMouseMove, true);
    
      if (longPressFlag) {
        longPressFlag = false;
    
        setTimeout(() => {
          // prevents odd double pause/play behavior
        }, 20);
      }
    }, true);


    video.addEventListener('pause', (e) => {
      setPersistentSpeed = false;
      newPersistentSpeed = originalSpeed;
      indicator.style.fontWeight = 'normal';

      if (longPressFlag) {
        video.play();  
      }

    }, true);

    // video.addEventListener('click', () => {
    //   setPersistentSpeed = false;
    //   newPersistentSpeed = originalSpeed;
    //   indicator.style.fontWeight = 'normal';
    // }, true);


  } // End of if statement

  // setTimeout(() => {
    console.log('setPersistentSpeed', setPersistentSpeed);
    if (setPersistentSpeed) {
      video.playbackRate = newPersistentSpeed;
      // setPersistentSpeed = false;
    }
    
  // }, 150);

  


} // End of init function


function handleMouseMove(e) {
  if (!longPressFlag) return;

  const deltaX = e.clientX - initialX;
  const deltaY = e.clientY - initialY;


  if (deltaX > tier2) {
    video.playbackRate = fullMaxPlaybackSpeed
    indicator.innerText = `${video.playbackRate}x Speed`;
  } else if (deltaX > tier1 && deltaX < tier2) {
    video.playbackRate = maxPlaybackSpeed
    indicator.innerText = `${video.playbackRate}x Speed`;
  } else if (deltaX < -tier2) {
    video.playbackRate = fullMinPlaybackSpeed
    indicator.innerText = `${video.playbackRate}x Speed`;
  } else if (deltaX < -tier1) {
    video.playbackRate = minPlaybackSpeed
    indicator.innerText = `${video.playbackRate}x Speed`;
  } else {
    video.playbackRate = playbackSpeed;
    indicator.innerText = `${playbackSpeed}x Speed`;
  }

  if (deltaY > 60 || deltaY < -60) {
    setPersistentSpeed = true;
    newPersistentSpeed = video.playbackRate;
    indicator.style.fontWeight = 'bold';
  } else {
    setPersistentSpeed = false;
    newPersistentSpeed = originalSpeed;
    // make not bold anymore
    indicator.style.fontWeight = 'normal';
  }

}


// Call it every 500 ms
setInterval(init, 500);
