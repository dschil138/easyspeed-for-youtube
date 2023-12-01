let video, moviePlayer;
let longPressTimer, longPressFlag = false;
let originalSpeed = 1, minSpeed = 1.25, slowSpeed = 1.5, mainSpeed = 2, fastSpeed = 3, maxSpeed = 5, periodKeySpeed = 5, commaKeySpeed = 2;
let setPersistentSpeed = false, speedPersisting = false, newPersistentSpeed;
let firstRewind = true;
let rewindInterval = null;

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
const YTSettings = 'ytp-settings-menu';
const YTSuggestion = 'ytp-suggested-action-badge';
const YTInfoButton = 'ytp-cards-button-icon';
const YTPaidContent = 'ytp-paid-content-overlay';

const overlayDiv = document.querySelector('.ytp-doubletap-ui-legacy');


function log(...args) {
    if (isDebugMode) {
        console.log(...args);
    }
}

function newSpeed(rate) {
    video.playbackRate = rate;
    indicator.innerText = `${rate}x Speed`;
    clearInterval(rewindInterval);
    rewindInterval = null;
    firstRewind = true;
}


function addIndicator(video, rate) {
    indicator.innerText = `${rate}x Speed${rate === 16 ? ' (max)' : ''}`;
    indicator.style.fontSize = '1.4em';
    indicator.style.fontWeight = 'normal';
    indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.35)';
    indicator.style.display = 'block';
    let offset = video.clientHeight / 30
    if (isEmbeddedVideo) {
        offset = offset * 3;
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
