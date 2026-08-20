/**
 * Main App bootstrap
 */
document.addEventListener('DOMContentLoaded', () => {
  // Init modules
  Sounds.init();
  Cat.init();
  Interactions.init();

  // Load settings
  const data = Storage.load();
  Sounds.setEnabled(data.sound);
  Sounds.setMusic(data.music);

  // Apply night mode
  if (data.night) {
    document.getElementById('app').classList.add('night');
    document.getElementById('nightToggle').checked = true;
  }

  // UI toggles
  document.getElementById('soundToggle').checked = data.sound;
  document.getElementById('musicToggle').checked = data.music;
  document.getElementById('vibrateToggle').checked = data.vibrate;

  // Settings panel
  const panel = document.getElementById('settingsPanel');
  document.getElementById('settingsBtn').addEventListener('click', () => {
    updateStatsUI();
    panel.classList.remove('hidden');
  });
  document.getElementById('closeSettings').addEventListener('click', () => {
    panel.classList.add('hidden');
  });

  // Setting changes
  document.getElementById('soundToggle').addEventListener('change', (e) => {
    Sounds.setEnabled(e.target.checked);
    Storage.update({ sound: e.target.checked });
  });
  document.getElementById('musicToggle').addEventListener('change', (e) => {
    Sounds.setMusic(e.target.checked);
    Storage.update({ music: e.target.checked });
  });
  document.getElementById('vibrateToggle').addEventListener('change', (e) => {
    Storage.update({ vibrate: e.target.checked });
  });
  document.getElementById('nightToggle').addEventListener('change', (e) => {
    document.getElementById('app').classList.toggle('night', e.target.checked);
    Storage.update({ night: e.target.checked });
  });

  // Start breathing
  Cat.startBreathing();

  // First visit message
  if (!data.firstTouch) {
    setTimeout(() => {
      Interactions.showToast('🐱 বিড়ালটাকে স্পর্শ করো!');
    }, 1200);
  }

  // Session count
  Storage.increment('totalSessions');

  // Prevent context menu on long press (kids)
  document.addEventListener('contextmenu', e => e.preventDefault());

  // Unlock audio on first interaction
  const unlock = () => {
    Sounds.resume();
    document.removeEventListener('touchstart', unlock);
    document.removeEventListener('click', unlock);
  };
  document.addEventListener('touchstart', unlock, { once: true });
  document.addEventListener('click', unlock, { once: true });
});

function updateStatsUI() {
  const data = Storage.load();
  document.getElementById('statTaps').textContent = data.taps;
  document.getElementById('statFish').textContent = data.fishEaten;
  document.getElementById('statReactions').textContent = data.reactions;
}

// Simple vibration helper
function vibe(ms = 30) {
  const data = Storage.load();
  if (data.vibrate && navigator.vibrate) {
    navigator.vibrate(ms);
  }
}
