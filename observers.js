let skipAttempted = false;
let adOverlayPresent = false;

const adSkipButtonElement = '.ytp-ad-skip-button-icon-modern'
const adOverlayElement = '.ytp-ad-player-overlay-skip-or-preview';



const buttonObserver = new MutationObserver((mutationsList) => {
    if (skipAttempted) return;

    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            const adSkipButton = document.querySelector(adSkipButtonElement);
            if (adSkipButton) {
                log("found skip button");
                setTimeout(() => {
                    adSkipButton.click();
                    log("clicked skip");
                    setTimeout(() => {
                        video.playbackRate = 1;
                        log("CLICK: set playback to 1");
                        skipAttempted = false;
                    }, 50);
                }, 100);
                skipAttempted = true;
            }
        }
    }
});


const overlayObserverCallback = (mutationsList, observer) => {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            const adOverlay = document.querySelector(adOverlayElement);
            if (adOverlay) {
                if (!adOverlayPresent) {
                    // adOverlay appeared
                    log("Overlay appeared");
                    video.playbackRate = 16;
                    log("set playback to 16");

                    adOverlayPresent = true;
                }
            } else {
                if (adOverlayPresent) {
                    // adOverlay disappeared
                    log("Overlay disappeared");
                    video.playbackRate = 1;
                    log("OVERLAY: set playback to 1");

                    adOverlayPresent = false;
                }
            }
        }
    }
};
const overlayObserver = new MutationObserver(overlayObserverCallback);
