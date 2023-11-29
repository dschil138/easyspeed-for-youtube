chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === "install") {
        chrome.tabs.create({url: "https://davidschiller.net/easy-speed-drag-for-youtube.html"});
    }
});

