document.addEventListener('DOMContentLoaded', function() {
  const leftButtons = document.querySelectorAll('.left-speed-button');
  const leftestButtons = document.querySelectorAll('.leftest-speed-button');
  // const mainButtons = document.querySelectorAll('.speed-button');
  const rightButtons = document.querySelectorAll('.right-speed-button');
  const rightestButtons = document.querySelectorAll('.rightest-speed-button');


  // Load any previously saved settings
  chrome.storage.sync.get(['minSpeed', 'slowSpeed', 'fastSpeed', 'maxSpeed'], function(data) {
    const minSpeed = parseFloat(data.minSpeed) || 1.1;
    const slowSpeed = parseFloat(data.slowSpeed) || 1.5;
    // const speed = parseFloat(data.speed) || 2;
    const fastSpeed = parseFloat(data.fastSpeed) || 3;
    const maxSpeed = parseFloat(data.maxSpeed) || 5;
    document.querySelector(`[min-data-speed="${minSpeed}"]`).classList.add('selected');
    document.querySelector(`[slow-data-speed="${slowSpeed}"]`).classList.add('selected');
    // document.querySelector(`[main-data-speed="${speed}"]`).classList.add('selected');
    document.querySelector(`[fast-data-speed="${fastSpeed}"]`).classList.add('selected');
    document.querySelector(`[max-data-speed="${maxSpeed}"]`).classList.add('selected');
  });


  // popup tooltip for disabled 2x buttons
  document.addEventListener("DOMContentLoaded", function() {
    const buttons = document.querySelectorAll(".speed-button");
    
    buttons.forEach(button => {
        button.addEventListener("click", function(event) {
            const tooltip = this.querySelector(".tooltip");
            tooltip.style.display = tooltip.style.display === "inline-block" ? "none" : "inline-block";
        });
    });
  }

);



leftestButtons.forEach((button) => {
    button.addEventListener('click', function() {

      const minSpeed = this.getAttribute('min-data-speed');

      // Remove 'selected' class from the buttons but add it to just to clicked button
      leftestButtons.forEach((btn) => btn.classList.remove('selected'));
      this.classList.add('selected');

      // Save it in Chrome
      chrome.storage.sync.set({minSpeed: minSpeed});

       // Send a message to the content script
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "runInit"});
      });
    });
  });


  leftButtons.forEach((button) => {
    button.addEventListener('click', function() {
      const slowSpeed = this.getAttribute('slow-data-speed');

      // Remove 'selected' class from the buttons but add it to just to clicked button
      leftButtons.forEach((btn) => btn.classList.remove('selected'));
      this.classList.add('selected');

      // Save it in Chrome
      chrome.storage.sync.set({slowSpeed: slowSpeed});
      
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "runInit"});
      });
    });
  });


  rightButtons.forEach((button) => {
    button.addEventListener('click', function() {
      const fastSpeed = this.getAttribute('fast-data-speed');

      rightButtons.forEach((btn) => btn.classList.remove('selected'));
      this.classList.add('selected');

      chrome.storage.sync.set({fastSpeed: fastSpeed});

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "runInit"});
      });
    });
  });


  rightestButtons.forEach((button) => {
    button.addEventListener('click', function() {
      const maxSpeed = this.getAttribute('max-data-speed');

      rightestButtons.forEach((btn) => btn.classList.remove('selected'));
      this.classList.add('selected');

      chrome.storage.sync.set({maxSpeed: maxSpeed});

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "runInit"});
      });
    });
  });



});

