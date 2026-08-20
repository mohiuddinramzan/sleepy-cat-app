/**
 * Cat state, mood and visual reactions
 */
const Cat = {
  mood: 'sleepy',          // sleepy | happy | hungry | angry | excited
  tapCount: 0,             // consecutive taps
  lastInteraction: Date.now(),
  isBusy: false,
  element: null,
  overlay: null,
  zzz: null,
  moodBadge: null,

  moods: {
    sleepy:   { emoji: '😴', label: 'ঘুমাচ্ছে' },
    happy:    { emoji: '😺', label: 'খুশি' },
    hungry:   { emoji: '😋', label: 'ক্ষুধার্ত' },
    angry:    { emoji: '😾', label: 'বিরক্ত' },
    excited:  { emoji: '😹', label: 'উত্তেজিত' }
  },

  init() {
    this.element = document.getElementById('catImg');
    this.overlay = document.getElementById('catOverlay');
    this.zzz = document.getElementById('zzz');
    this.moodBadge = document.getElementById('moodBadge');
    this.setMood('sleepy');
    this.startIdleLoop();
  },

  setMood(mood) {
    if (!this.moods[mood]) return;
    this.mood = mood;
    if (this.moodBadge) {
      this.moodBadge.textContent = this.moods[mood].emoji;
      this.moodBadge.style.transform = 'scale(1.3)';
      setTimeout(() => {
        this.moodBadge.style.transform = 'scale(1)';
      }, 300);
    }
    // Show/hide Zzz
    if (this.zzz) {
      this.zzz.style.display = (mood === 'sleepy') ? 'block' : 'none';
    }
  },

  playAnim(className, duration = 800) {
    if (!this.element || this.isBusy) return;
    this.isBusy = true;
    this.element.classList.remove(
      'breathing', 'twitch', 'tail-wag', 'blink', 'yawn',
      'shake', 'happy', 'eating', 'sneeze', 'angry', 'flip'
    );
    // force reflow
    void this.element.offsetWidth;
    this.element.classList.add(className);
    setTimeout(() => {
      this.element.classList.remove(className);
      if (this.mood === 'sleepy') {
        this.element.classList.add('breathing');
      }
      this.isBusy = false;
    }, duration);
  },

  // Gentle breathing while sleeping
  startBreathing() {
    if (this.element && this.mood === 'sleepy') {
      this.element.classList.add('breathing');
    }
  },

  stopBreathing() {
    if (this.element) this.element.classList.remove('breathing');
  },

  // Idle random reactions every 5-15s
  startIdleLoop() {
    const loop = () => {
      const delay = 3500 + Math.random() * 6000;
      setTimeout(() => {
        if (!this.isBusy && this.mood === 'sleepy') {
          this.randomIdleEvent();
        }
        // Auto return to sleepy after long inactivity
        if (Date.now() - this.lastInteraction > 25000 && this.mood !== 'sleepy') {
          this.setMood('sleepy');
          this.startBreathing();
        }
        loop();
      }, delay);
    };
    loop();
  },

  randomIdleEvent() {
    const events = [
      () => { this.playAnim('yawn', 1200); Sounds.snore(); },
      () => { this.playAnim('twitch', 600); },
      () => { this.playAnim('tail-wag', 800); },
      () => { this.playAnim('blink', 400); },
      () => { Sounds.snore(); },
      () => { this.playAnim('shake', 500); } // dream kick
    ];
    const fn = events[Math.floor(Math.random() * events.length)];
    fn();
  },

  // Called on any user interaction
  touch() {
    this.lastInteraction = Date.now();
  },

  // Spawn a floating heart
  spawnHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = '💕';
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    document.getElementById('scene').appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
  }
};
