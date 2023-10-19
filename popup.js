document.addEventListener('DOMContentLoaded', function() {
  const leftButtons = document.querySelectorAll('.left-speed-button');
  // const mainButtons = document.querySelectorAll('.speed-button');
  const rightButtons = document.querySelectorAll('.right-speed-button');

  // Load any previously saved settings
  chrome.storage.sync.get(['minSpeed', 'speed', 'maxSpeed'], function(data) {
    const minSpeed = parseFloat(data.minSpeed) || 1.5;
    // const speed = parseFloat(data.speed) || 2;
    const maxSpeed = parseFloat(data.maxSpeed) || 3;
    document.querySelector(`[min-data-speed="${minSpeed}"]`).classList.add('selected');
    // document.querySelector(`[data-speed="${speed}"]`).classList.add('selected');
    document.querySelector(`[max-data-speed="${maxSpeed}"]`).classList.add('selected');
  });

  document.addEventListener("DOMContentLoaded", function() {
    const buttons = document.querySelectorAll(".speed-button");
    
    buttons.forEach(button => {
        button.addEventListener("click", function(event) {
            const tooltip = this.querySelector(".tooltip");
            tooltip.style.display = tooltip.style.display === "inline-block" ? "none" : "inline-block";
        });
    });
});




  leftButtons.forEach((button) => {
    button.addEventListener('click', function() {
      const minSpeed = this.getAttribute('min-data-speed');

      // Remove 'selected' class from the buttons but add it to just to clicked button
      leftButtons.forEach((btn) => btn.classList.remove('selected'));
      this.classList.add('selected');

      // Save it in Chrome
      chrome.storage.sync.set({minSpeed: minSpeed});
    });
  });

  // mainButtons.forEach((button) => {
  //   button.addEventListener('click', function() {
  //     const speed = this.getAttribute('data-speed');

  //     mainButtons.forEach((btn) => btn.classList.remove('selected'));
  //     this.classList.add('selected');

  //     chrome.storage.sync.set({speed: speed});
  //   });
  // });

  rightButtons.forEach((button) => {
    button.addEventListener('click', function() {
      const maxSpeed = this.getAttribute('max-data-speed');

      rightButtons.forEach((btn) => btn.classList.remove('selected'));
      this.classList.add('selected');

      chrome.storage.sync.set({maxSpeed: maxSpeed});
    });
  });



});

