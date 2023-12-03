document.addEventListener('DOMContentLoaded', function () {
    var closeButton = document.getElementById('close-btn');
    var popupContainer = document.getElementById('popup-container');


    const adSkipToggleSwitch = document.getElementById('adSkipToggleSwitch');

    chrome.storage.sync.get(['adSkipEnabled'], function (data) {
        adSkipToggleSwitch.checked = data.adSkipEnabled !== undefined ? data.adSkipEnabled : true;
    });



    adSkipToggleSwitch.addEventListener('input', function () {
        chrome.storage.sync.set({ 'adSkipEnabled': this.checked }, function () {
        });
        // console.log("adSkip: ", this.checked);
        runInit();
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
            // console.log('The user has been informed about the AutoSkip feature.');
        });
    });


    // function to send message to re-run init function in content.js
    function runInit() {
        // console.log("runInit from popup");
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "runInit" });
        });
    }


});
