
let hotkeyOriginalSpeed = 1;
let isPeriodKeyDown = false, isCommaKeyDown = false, periodPressed = false, commaPressed = false, doubleTapAndHoldPeriod = false, doubleTapAndHoldComma = false, keydownTimer, lastPeriodKeyReleaseTime = 0, lastCommaKeyReleaseTime = 0;

// ytp-settings-menu

function keydownHandler(e) {
    if (!extensionEnabled || !hotkeysEnabled) return;

    if (e.key === '.') {
        let currentTimeStamp = Date.now();
        let timeDifference = currentTimeStamp - lastPeriodKeyReleaseTime;

        if (timeDifference < 400) {
            doubleTapAndHoldPeriod = true;
        }

        // double tap and hold period will give us double speed, up to max of 16x
        if (doubleTapAndHoldPeriod) {
            isPeriodKeyDown = true;
            video.playbackRate = Math.min(periodKeySpeed * 2, 16);
            addIndicator(video, Math.min(periodKeySpeed * 2, 16));
        } else {
            video.playbackRate = periodKeySpeed;
            addIndicator(video, periodKeySpeed);
        }

    } else if (e.key === ',') {
        let currentTimeStamp = Date.now();
        let timeDifference = currentTimeStamp - lastCommaKeyReleaseTime;

        if (timeDifference < 400) {
            doubleTapAndHoldComma = true;
        }
        // double tap and hold comma will give us 0.75x speed
        if (doubleTapAndHoldComma) {
            isCommaKeyDown = true;
            video.playbackRate = 0.75;
            addIndicator(video, 0.75);
        } else {
            video.playbackRate = commaKeySpeed;
            addIndicator(video, commaKeySpeed);
        }
    }
};


function keyupHandler(e) {
    if (e.key === '.') {
        doubleTapAndHoldPeriod = false;
        lastPeriodKeyReleaseTime = Date.now();
        isPeriodKeyDown = false;
        indicator.style.display = 'none';
        if (!isPeriodKeyDown) {
            video.playbackRate = 1;
        }
    }
    if (e.key === ',') {
        doubleTapAndHoldComma = false;
        lastCommaKeyReleaseTime = Date.now();
        isCommaKeyDown = false;
        indicator.style.display = 'none';
        if (!isCommaKeyDown) {
            video.playbackRate = 1;
        }
    }
};




// MOUSE DOWN HANDLER
function mousedownHandler(moviePlayer, e) {
    if (!extensionEnabled) return;
    mouseIsDown = true;
    log("mouse down");

    initialX = e.clientX;
    initialY = e.clientY;
    setPersistentSpeed = false;

    const elements = document.elementsFromPoint(e.clientX, e.clientY);

    // // we don't want to trigger the extension if the user is just using the controls at the bottom of the video
    // if (elements.some(el => el.classList.contains(chromeControls)) || elements.some(el => el.classList.contains(chromeControlsPadding)) || elements.some(el => el.classList.contains(YTAd)) || elements.some(el => el.classList.contains(YTAdSkip)) || elements.some(el => el.classList.contains(YTSettings)) || elements.some(el => el.classList.contains(YTAdSuggestion)) || elements.some(el => el.classList.contains(YTInfoButton))) {
    //     log("mousedown return early element");
    //     return;
    // }

    // if (elements.some(el => el.classList.contains(YTSettings))) {
    //     const style = window.getComputedStyle(el);
    //     if (style.display !== 'none') {
    //         log("mousedown return early bc settings");
    //         return;
    //     }
    // };
    // const chromeControls = 'ytp-chrome-bottom';
    // const chromeControlsPadding = 'ytp-progress-bar-padding';
    // const YTAd = 'ytp-ad-preview-container';
    // const YTAdImage = 'ytp-ad-image';
    // const YTAdSkip = 'ytp-ad-skip-button-container';
    // const YTSettings = 'ytp-settings-menu';
    // const YTSuggestion = 'ytp-suggested-action-badge';
    // const YTInfoButton = 'ytp-cards-button-icon';
    // // ytp-paid-content-overlay-icon
    // const YTPaidContent = 'ytp-paid-content-overlay-icon';

    const classList = ['ytp-chrome-bottom', 'ytp-progress-bar-padding', 'ytp-ad-preview-container', 'ytp-ad-image', 'ytp-ad-skip-button-container', 'ytp-settings-menu', 'ytp-suggested-action-badge', 'ytp-cards-button-icon', 'ytp-paid-content-overlay'];

    if (elements.some(el => classList.some(cls => el.classList.contains(cls)))) {
        log("mousedown return early element");
        return;
    }


    longPressTimer = setTimeout(async () => {
        if (!speedPersisting) {
            originalSpeed = await findOriginalSpeed();
        }
        video.playbackRate = mainSpeed;
        addIndicator(video, mainSpeed);
        longPressFlag = true;

        setTimeout(() => {
            if (mouseIsDown) {
                video.playbackRate = mainSpeed;
            }
        }, 183);
    }, 320);
}


// MOUSE UP HANDLER
function mouseupHandler(moviePlayer, e) {
    mouseIsDown = false;
    clearTimeout(longPressTimer);
    firstRewind = true;
    clearInterval(rewindInterval);
    rewindInterval = null;
    deltax = 0;
    deltay = 0;

    if (setPersistentSpeed) {
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 1250);
    } else {
        indicator.style.display = 'none';
    }

    setTimeout(() => {
        longPressFlag = false;
    }, 100);
}


// CLICK HANDLER
function clickHandler(moviePlayer, e) {
    if (!extensionEnabled) return;
    mouseIsDown = false;
    clearTimeout(longPressTimer);
    clearInterval(rewindInterval);
    rewindInterval = null;

    if (longPressFlag) {

        if (speedPersisting && !setPersistentSpeed) {
            video.playbackRate = originalSpeed;
            speedPersisting = false;

        } else if (setPersistentSpeed) {
            video.playbackRate = newPersistentSpeed;
            speedPersisting = true;
        } else {
            video.playbackRate = originalSpeed;
            speedPersisting = false;
        }

        longPressFlag = false;
        e.stopPropagation();
        e.preventDefault();
    }
}

function handleMouseLeave(moviePlayer, e) {
    // get elements at mouse position
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    // if #movie_player is one of them, return early
    if (elements.some(el => el.id === 'movie_player')) {
        log("returning bc mouse is over movie player");
        return;
    } else {
        log("left Movie Player");
        indicator.style.display = 'none';
        mouseIsDown = false;
        clearInterval(rewindInterval);
        clearTimeout(longPressTimer);
        rewindInterval = null;
        firstRewind = true;
        if (longPressFlag) {

            if (speedPersisting && !setPersistentSpeed) {
                video.playbackRate = originalSpeed;
                speedPersisting = false;

            } else if (setPersistentSpeed) {
                video.playbackRate = newPersistentSpeed;
                speedPersisting = true;
            } else {
                video.playbackRate = originalSpeed;
                speedPersisting = false;
            }

            longPressFlag = false;
        }
    }

}


// MOUSE MOVE HANDLER
function handleMouseMove(moviePlayer, e) {
    if (!extensionEnabled || !longPressFlag) return;



    // make it a bit easier to work with smaller videos
    width = moviePlayer.clientWidth;
    if (width < 450) {
        dynamicTier1 = tier1 / 1.8;
        dynamicTier2 = tier2 / 1.8;
        dynamicTier3 = tier3 / 1.8;
        dynamicVerticalTier = verticalTier / 1.8;
    } else {
        dynamicTier1 = tier1;
        dynamicTier2 = tier2;
        dynamicTier3 = tier3;
        dynamicVerticalTier = verticalTier;
    }

    const deltaX = e.clientX - initialX;
    const deltaY = e.clientY - initialY;

    // X Axis will set the speed
    if (deltaX > dynamicTier2) {
        newSpeed(maxSpeed);
    } else if (deltaX > dynamicTier1 && deltaX < dynamicTier2) {
        newSpeed(fastSpeed);
    } else if (deltaX < -dynamicTier3) {
        indicator.innerText = `REWIND`;
        if (firstRewind) {
            firstRewind = false;
            simulateLeftArrowKeyPress();
        }
        if (!rewindInterval) {
            rewindInterval = setInterval(() => {
                simulateLeftArrowKeyPress();
            }, 800);
        }
    } else if (deltaX < -dynamicTier2) {
        newSpeed(minSpeed);
    } else if (deltaX < -dynamicTier1) {
        newSpeed(slowSpeed);
    } else {
        newSpeed(mainSpeed);
    }

    // Y Axis will decide if speed is persistent after releasing click
    if (deltaY > dynamicVerticalTier || deltaY < -dynamicVerticalTier) {
        setPersistentSpeed = true;
        newPersistentSpeed = video.playbackRate;
        indicator.style.fontWeight = 'bold';
        indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    } else {
        setPersistentSpeed = false;
        indicator.style.fontWeight = 'normal';
        indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.35)';
    }
}

