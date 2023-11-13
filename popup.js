document.addEventListener('DOMContentLoaded', function() {

  const leftButtons = document.querySelectorAll('.left-speed-button');
  const leftestButtons = document.querySelectorAll('.leftest-speed-button');
  const centerButtons = document.querySelectorAll('.speed-button');
  const rightButtons = document.querySelectorAll('.right-speed-button');
  const rightestButtons = document.querySelectorAll('.rightest-speed-button');
  const toggleSwitch = document.getElementById('toggleSwitch');
  const keysToggleSwitch = document.getElementById('keysToggleSwitch');

  chrome.storage.sync.get('extensionEnabled', function(data) {
    toggleSwitch.checked = data.extensionEnabled !== undefined ? data.extensionEnabled : true;
  });
  chrome.storage.sync.get('hotkeysEnabled', function(data) {
    keysToggleSwitch.checked = data.hotkeysEnabled !== undefined ? data.hotkeysEnabled : true;
  });

  toggleSwitch.addEventListener('change', function() {
    console.log("Switch state: ", this.checked);
    chrome.storage.sync.set({'extensionEnabled': this.checked}, function() {
        console.log('Extension enabled state is set to ', this.checked);
    });
    runInit();
  });

  keysToggleSwitch.addEventListener('change', function() {
    console.log("Switch state: ", this.checked);
    chrome.storage.sync.set({'hotkeysEnabled': this.checked}, function() {
        console.log('Extension enabled state is set to ', this.checked);
    });
    runInit();
  });


  // Load any previously saved settings
  chrome.storage.sync.get(['minSpeed', 'slowSpeed', 'mainSpeed', 'fastSpeed', 'maxSpeed', 'commaKeySpeed', 'periodKeySpeed'], function(data) {
    const commaKeySpeed = data.commaKeySpeed || 2;
    const periodKeySpeed = data.periodKeySpeed || 5;
    const minSpeed = data.minSpeed || 1.25;
    const slowSpeed = data.slowSpeed || 1.5;
    const mainSpeed = data.mainSpeed || 2;
    const fastSpeed = data.fastSpeed || 3;
    const maxSpeed = data.maxSpeed || 5;
    document.querySelector(`[min-data-speed="${minSpeed}"]`).classList.add('selected');
    document.querySelector(`[slow-data-speed="${slowSpeed}"]`).classList.add('selected');
    document.querySelector(`[main-data-speed="${mainSpeed}"]`).classList.add('selected');
    document.querySelector(`[fast-data-speed="${fastSpeed}"]`).classList.add('selected');
    document.querySelector(`[max-data-speed="${maxSpeed}"]`).classList.add('selected');
    document.querySelector('#period-quantity').value = periodKeySpeed;
    document.querySelector('#comma-quantity').value = commaKeySpeed;
  });

// function to send message to re-run init function in content.js
function runInit() {
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {action: "runInit"});
});
}

// function to handle button clicks and store associated speeds in chrome storage
function buttonHandler(buttonGroup, dataAttribute, speedName) {
  buttonGroup.forEach((button) => {
    button.addEventListener('click', function() {
      const speedValue = this.getAttribute(dataAttribute);

      buttonGroup.forEach((btn) => btn.classList.remove('selected'));
      this.classList.add('selected');

      chrome.storage.sync.set({[speedName]: speedValue});

      runInit();
    });
  });
}



buttonHandler(leftestButtons, 'min-data-speed', 'minSpeed');
buttonHandler(leftButtons, 'slow-data-speed', 'slowSpeed');
buttonHandler(centerButtons, 'main-data-speed', 'mainSpeed');
buttonHandler(rightButtons, 'fast-data-speed', 'fastSpeed');
buttonHandler(rightestButtons, 'max-data-speed', 'maxSpeed');



const commaKeyInput = document.querySelector('#comma-quantity');
  commaKeyInput.addEventListener('input', function() {
    const commaSpeed = commaKeyInput.value;
    console.log(commaSpeed);
    chrome.storage.sync.set({'commaKeySpeed': commaSpeed});
    runInit();
  });

const periodKeyInput = document.querySelector('#period-quantity');
  periodKeyInput.addEventListener('input', function() {
    const periodSpeed = periodKeyInput.value;
    console.log(periodSpeed);
    chrome.storage.sync.set({'periodKeySpeed': periodSpeed});
    runInit();
  });


});

