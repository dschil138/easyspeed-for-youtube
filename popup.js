

document.addEventListener('DOMContentLoaded', function() {
  let addedListeners = false;


  function handleInput(inputId, storageKey) {
    console.log("handling")
    console.log(inputId, storageKey)
    const inputElement = document.querySelector(inputId);
        const inputValue = inputElement.value;
        chrome.storage.sync.set({[storageKey]: inputValue});
        runInit();
  }
  
  // Load any previously saved settings
  chrome.storage.sync.get(['minSpeed', 'slowSpeed', 'mainSpeed', 'fastSpeed', 'maxSpeed', 'commaKeySpeed', 'periodKeySpeed'], function(data) {

    console.log(data);
    const commaKeySpeed = data.commaKeySpeed || 2;
    const periodKeySpeed = data.periodKeySpeed || 5;

    const minSpeed = data.minSpeed || 2;
    const slowSpeed = data.slowSpeed || 5;
    const mainSpeed = data.mainSpeed || 2;
    const fastSpeed = data.fastSpeed || 5;
    const maxSpeed = data.maxSpeed || 2;

    console.log(commaKeySpeed, periodKeySpeed);
    console.log(minSpeed, slowSpeed, mainSpeed, fastSpeed, maxSpeed);

    document.querySelector('#period-quantity').value = periodKeySpeed;
    document.querySelector('#comma-quantity').value = commaKeySpeed;

    // document.querySelector('#min-quantity').value = minSpeed;
    // document.querySelector('#slow-quantity').value = slowSpeed;
    // document.querySelector('#main-quantity').value = mainSpeed;
    // document.querySelector('#fast-quantity').value = fastSpeed;
    // document.querySelector('#max-quantity').value = maxSpeed;

    // console.log("before")
    // console.log(document.getElementById('main-quantity').value);
    document.getElementById('min-quantity').value = minSpeed;
    document.getElementById('slow-quantity').value = slowSpeed;
    document.getElementById('main-quantity').value = mainSpeed;
    document.getElementById('fast-quantity').value = fastSpeed;
    document.getElementById('max-quantity').value = maxSpeed;
    // console.log("after")
    // console.log(document.getElementById('main-quantity').value);



  });


  let minQuantity = document.getElementById('min-quantity');
  let slowQuantity = document.getElementById('slow-quantity');
  let mainQuantity = document.getElementById('main-quantity');
  let fastQuantity = document.getElementById('fast-quantity');
  let maxQuantity = document.getElementById('max-quantity');
  let commaQuantity = document.getElementById('comma-quantity');
  let periodQuantity = document.getElementById('period-quantity');


  const toggleSwitch = document.getElementById('toggleSwitch');
  const keysToggleSwitch = document.getElementById('keysToggleSwitch');

  chrome.storage.sync.get('extensionEnabled', function(data) {
    toggleSwitch.checked = data.extensionEnabled !== undefined ? data.extensionEnabled : true;
  });
  chrome.storage.sync.get('hotkeysEnabled', function(data) {
    keysToggleSwitch.checked = data.hotkeysEnabled !== undefined ? data.hotkeysEnabled : true;
  });




  if (!addedListeners) {
      
    document.getElementById('incrementMin').addEventListener('click', function() {
      minQuantity.value = +(parseFloat(minQuantity.value) + 0.25).toFixed(2);
      handleInput('#min-quantity', 'minSpeed');
    });
    document.getElementById('decrementMin').addEventListener('click', function() {
        minQuantity.value = +(parseFloat(minQuantity.value) - 0.25).toFixed(2);
        handleInput('#min-quantity', 'minSpeed');
    });

    document.getElementById('min-quantity').addEventListener('input', function() {
      handleInput('#min-quantity', 'minSpeed');
    });

    document.getElementById('incrementSlow').addEventListener('click', function() {
      slowQuantity.value = +(parseFloat(slowQuantity.value) + 0.25).toFixed(2);
      handleInput('#slow-quantity', 'slowSpeed');
    });
    document.getElementById('decrementSlow').addEventListener('click', function() {
        slowQuantity.value = +(parseFloat(slowQuantity.value) - 0.25).toFixed(2);
        handleInput('#slow-quantity', 'slowSpeed');
    });

    document.getElementById('slow-quantity').addEventListener('input', function() {
      handleInput('#slow-quantity', 'slowSpeed');
    });

    document.getElementById('incrementMain').addEventListener('click', function() {
      mainQuantity.value = +(parseFloat(mainQuantity.value) + 0.25).toFixed(2);
      handleInput('#main-quantity', 'mainSpeed');
    });
    document.getElementById('decrementMain').addEventListener('click', function() {
      mainQuantity.value = +(parseFloat(mainQuantity.value) - 0.25).toFixed(2);
      handleInput('#main-quantity', 'mainSpeed');
    });

    document.getElementById('main-quantity').addEventListener('input', function() {
      handleInput('#main-quantity', 'mainSpeed');
    });

    document.getElementById('incrementFast').addEventListener('click', function() {
      fastQuantity.value = +(parseFloat(fastQuantity.value) + 0.25).toFixed(2);
      handleInput('#fast-quantity', 'fastSpeed');
    });
    document.getElementById('decrementFast').addEventListener('click', function() {
        fastQuantity.value = +(parseFloat(fastQuantity.value) - 0.25).toFixed(2);
        handleInput('#fast-quantity', 'fastSpeed');
    });

    document.getElementById('fast-quantity').addEventListener('input', function() {
      handleInput('#fast-quantity', 'fastSpeed');
    });

    document.getElementById('incrementMax').addEventListener('click', function() {
      maxQuantity.value = +(parseFloat(maxQuantity.value) + 0.25).toFixed(2);
      handleInput('#max-quantity', 'maxSpeed');
    });
    document.getElementById('decrementMax').addEventListener('click', function() {
        maxQuantity.value = +(parseFloat(maxQuantity.value) - 0.25).toFixed(2);
        handleInput('#max-quantity', 'maxSpeed');
    });

    document.getElementById('max-quantity').addEventListener('input', function() {
      handleInput('#max-quantity', 'maxSpeed');
    });




    document.getElementById('incrementComma').addEventListener('click', function() {
      commaQuantity.value = +(parseFloat(commaQuantity.value) + 0.25).toFixed(2);
      handleInput('#comma-quantity', 'commaKeySpeed');
    });
    document.getElementById('decrementComma').addEventListener('click', function() {
        commaQuantity.value = +(parseFloat(commaQuantity.value) - 0.25).toFixed(2);
        handleInput('#comma-quantity', 'commaKeySpeed');
    });
    document.getElementById('incrementPeriod').addEventListener('click', function() {
      periodQuantity.value = +(parseFloat(periodQuantity.value) + 0.25).toFixed(2);
      handleInput('#period-quantity', 'periodKeySpeed');
    });
    document.getElementById('decrementPeriod').addEventListener('click', function() {
        periodQuantity.value = +(parseFloat(periodQuantity.value) - 0.25).toFixed(2);
        handleInput('#period-quantity', 'periodKeySpeed');
    });
    





    toggleSwitch.addEventListener('input', function() {
      console.log("Switch state: ", this.checked);
      chrome.storage.sync.set({'extensionEnabled': this.checked}, function() {
          console.log('Extension enabled state is set to ', this.checked);
      });
      runInit();
    });

    keysToggleSwitch.addEventListener('input', function() {
      console.log("Switch state: ", this.checked);
      chrome.storage.sync.set({'hotkeysEnabled': this.checked}, function() {
          console.log('Extension enabled state is set to ', this.checked);
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