

document.addEventListener('DOMContentLoaded', function() {
  let addedListeners = false;


  function handleInput(inputId, storageKey) {
    const inputElement = document.querySelector(inputId);
        const inputValue = inputElement.value;
        chrome.storage.sync.set({[storageKey]: inputValue});
        runInit();
  }
  
  // Load any previously saved settings
  chrome.storage.sync.get(['minSpeed', 'slowSpeed', 'mainSpeed', 'fastSpeed', 'maxSpeed', 'commaKeySpeed', 'periodKeySpeed'], function(data) {

    const commaKeySpeed = data.commaKeySpeed || 2;
    const periodKeySpeed = data.periodKeySpeed || 5;

    const minSpeed = data.minSpeed || 2;
    const slowSpeed = data.slowSpeed || 5;
    const mainSpeed = data.mainSpeed || 2;
    const fastSpeed = data.fastSpeed || 5;
    const maxSpeed = data.maxSpeed || 2;

    document.querySelector('#period-quantity').value = periodKeySpeed;
    document.querySelector('#comma-quantity').value = commaKeySpeed;

    document.getElementById('min-quantity').value = minSpeed;
    document.getElementById('slow-quantity').value = slowSpeed;
    document.getElementById('main-quantity').value = mainSpeed;
    document.getElementById('fast-quantity').value = fastSpeed;
    document.getElementById('max-quantity').value = maxSpeed;

  });


  const toggleSwitch = document.getElementById('toggleSwitch');
  const keysToggleSwitch = document.getElementById('keysToggleSwitch');

  chrome.storage.sync.get('extensionEnabled', function(data) {
    toggleSwitch.checked = data.extensionEnabled !== undefined ? data.extensionEnabled : true;
  });
  chrome.storage.sync.get('hotkeysEnabled', function(data) {
    keysToggleSwitch.checked = data.hotkeysEnabled !== undefined ? data.hotkeysEnabled : true;
  });




  if (!addedListeners) {

    function addQuantityHandlers(quantityId, incrementId, decrementId, storageKey, handleInput) {
      const quantityElement = document.getElementById(quantityId);
      const incrementElement = document.getElementById(incrementId);
      const decrementElement = document.getElementById(decrementId);


      incrementElement.addEventListener('click', function() {
        quantityElement.value = +(parseFloat(quantityElement.value) + 0.25).toFixed(2);
        handleInput(`#${quantityId}`, storageKey);
      });

      decrementElement.addEventListener('click', function() {
        quantityElement.value = +(parseFloat(quantityElement.value) - 0.25).toFixed(2);
        handleInput(`#${quantityId}`, storageKey);
      });

      quantityElement.addEventListener('input', function() {
        handleInput(`#${quantityId}`, storageKey);
      });
    }

    addQuantityHandlers('min-quantity', 'incrementMin', 'decrementMin', 'minSpeed', handleInput);
    addQuantityHandlers('slow-quantity', 'incrementSlow', 'decrementSlow', 'slowSpeed', handleInput);
    addQuantityHandlers('main-quantity', 'incrementMain', 'decrementMain', 'mainSpeed', handleInput);
    addQuantityHandlers('fast-quantity', 'incrementFast', 'decrementFast', 'fastSpeed', handleInput);
    addQuantityHandlers('max-quantity', 'incrementMax', 'decrementMax', 'maxSpeed', handleInput);
    addQuantityHandlers('comma-quantity', 'incrementComma', 'decrementComma', 'commaKeySpeed', handleInput);
    addQuantityHandlers('period-quantity', 'incrementPeriod', 'decrementPeriod', 'periodKeySpeed', handleInput);


    toggleSwitch.addEventListener('input', function() {
      chrome.storage.sync.set({'extensionEnabled': this.checked}, function() {
      });
      runInit();
    });

    keysToggleSwitch.addEventListener('input', function() {
      chrome.storage.sync.set({'hotkeysEnabled': this.checked}, function() {
      });
      runInit();
    });

    addedListeners = true;
  }



// function to send message to re-run init function in content.js
function runInit() {
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {action: "runInit"});
});
}



});