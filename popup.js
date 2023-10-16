document.addEventListener('DOMContentLoaded', function() {
  const buttons = document.querySelectorAll('.speed-button');

  // Load any previously saved setting
  chrome.storage.sync.get('speed', function(data) {
    const speed = parseFloat(data.speed) || 2;
    document.querySelector(`[data-speed="${speed}"]`).classList.add('selected');
  });

  buttons.forEach((button) => {
    button.addEventListener('click', function() {
      const speed = this.getAttribute('data-speed');

      // Remode 'selected' class from the buttons but add it to just to clicked button
      buttons.forEach((btn) => btn.classList.remove('selected'));
      this.classList.add('selected');

      // Save it
      chrome.storage.sync.set({speed: speed});
    });
  });
});

