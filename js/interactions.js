/**
 * All interactive modes: Pet, Feather, Feed, Pillow
 */
const Interactions = {
  mode: null,               // null | 'feather' | 'feed' | 'pillow'
  floating: null,
  dragOffset: { x: 0, y: 0 },
  isDragging: false,
  disturbCount: 0,          // for pillow push-away

  init() {
    this.floating = document.getElementById('floatingItem');
    this.bindButtons();
    this.bindCatTap();
    this.bindDrag();
  },

  bindButtons() {
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        Sounds.resume();
        this.handleAction(action);
      });
    });
  },

  handleAction(action) {
    // Clear previous floating item
    this.clearFloating();
    this.mode = null;
    this.disturbCount = 0;

    switch (action) {
      case 'pet':
        this.doPet();
        break;
      case 'feather':
        this.startFeather();
        break;
      case 'feed':
        this.startFeed();
        break;
      case 'pillow':
        this.startPillow();
        break;
    }
  },

  // ===== PET / TAP =====
  bindCatTap() {
    const area = document.getElementById('catArea');
    area.addEventListener('click', (e) => {
      // Only direct pet when no special mode
      if (this.mode) return;
      this.doPet(e);
    });
  },

  doPet(e) {
    Cat.touch();
    Cat.tapCount++;
    Storage.increment('taps');
    Storage.increment('reactions');
    Sounds.tap();

    const count = Cat.tapCount;

    if (count === 1) {
      Cat.playAnim('blink', 400);
      Sounds.meow();
      Cat.setMood('sleepy');
      this.showToast('😴 মিঁয়াও~');
    } else if (count === 2) {
      Cat.playAnim('twitch', 600);
      Sounds.meow();
      this.showToast('👀 কে আমাকে ছুঁয়েছে?');
    } else if (count === 3) {
      Cat.playAnim('shake', 500);
      Cat.setMood('angry');
      Sounds.angry();
      this.showToast('😾 আর বিরক্ত করো না!');
    } else if (count >= 4) {
      Cat.playAnim('angry', 700);
      Sounds.angry();
      Cat.setMood('angry');
      this.showToast('😾 হুমফ!');
      // Reset after a while
      setTimeout(() => {
        Cat.tapCount = 0;
        Cat.setMood('sleepy');
        Cat.startBreathing();
      }, 3000);
    }

    // Hearts on gentle pet
    if (count <= 2 && e) {
      const rect = document.getElementById('catArea').getBoundingClientRect();
      Cat.spawnHeart(e.clientX - rect.left, e.clientY - rect.top - 40);
    }

    this.checkAchievements();
  },

  // ===== FEATHER =====
  startFeather() {
    this.mode = 'feather';
    this.spawnFloating('🪶', 'feather');
    this.showToast('🪶 বিড়ালকে দুলিয়ে দাও!');
    Cat.setMood('excited');
  },

  onFeatherTouch(zone) {
    Cat.touch();
    Storage.increment('reactions');
    switch (zone) {
      case 'nose':
        Cat.playAnim('sneeze', 600);
        Sounds.sneeze();
        this.showToast('🤧 হাঁচি!');
        break;
      case 'ear':
        Cat.playAnim('twitch', 600);
        Sounds.meow();
        this.showToast('👂 কান নাড়াচ্ছে');
        break;
      case 'belly':
        Cat.playAnim('happy', 800);
        Sounds.happy();
        Cat.setMood('happy');
        this.showToast('😹 হাহাহা!');
        break;
      case 'paw':
        Cat.playAnim('shake', 500);
        Sounds.tap();
        this.showToast('🐾 পা গুটিয়ে নিল');
        break;
      default:
        Cat.playAnim('twitch', 500);
        Sounds.meow();
    }
    this.checkAchievements();
  },

  // ===== FEED =====
  startFeed() {
    this.mode = 'feed';
    this.spawnFloating('🐟', 'fish');
    this.showToast('🐟 মাছটা বিড়ালের কাছে নিয়ে যাও!');
    Cat.setMood('hungry');
  },

  onFishFeed() {
    Cat.touch();
    Cat.playAnim('eating', 900);
    Sounds.eat();
    Storage.increment('fishEaten');
    Storage.increment('reactions');
    Cat.setMood('happy');
    this.showToast('😋 নম নম~ সুস্বাদু!');
    
    // Clear fish with animation
    this.floating.classList.add('eaten');
    setTimeout(() => {
      this.clearFloating();
      // Happy then back to sleep
      setTimeout(() => {
        Cat.playAnim('happy', 700);
        Sounds.happy();
        setTimeout(() => {
          Cat.setMood('sleepy');
          Cat.startBreathing();
          Cat.tapCount = 0;
        }, 1500);
      }, 600);
    }, 500);

    this.checkAchievements();
  },

  // ===== PILLOW =====
  startPillow() {
    this.mode = 'pillow';
    this.spawnFloating('🛏️', 'pillow');
    this.showToast('🛏️ বালিশটা বিড়ালের কাছে দাও');
    this.disturbCount = 0;
  },

  onPillowPlace() {
    Cat.touch();
    this.disturbCount++;
    Storage.increment('pillows');
    Storage.increment('reactions');

    if (this.disturbCount >= 3) {
      // Push away
      Cat.playAnim('angry', 700);
      Sounds.angry();
      Cat.setMood('angry');
      this.showToast('😾 যা! ঘুমাতে দাও!');
      this.floating.classList.add('pushed');
      setTimeout(() => this.clearFloating(), 700);
      setTimeout(() => {
        Cat.setMood('sleepy');
        Cat.startBreathing();
      }, 2000);
    } else {
      // Soft settle
      Cat.playAnim('yawn', 1200);
      Sounds.pillow();
      Sounds.meow();
      this.showToast('😴 আহ্~ আরাম...');
      Cat.setMood('sleepy');
      // Keep pillow near for a bit then remove
      setTimeout(() => {
        this.clearFloating();
        Cat.startBreathing();
      }, 2500);
    }
    this.checkAchievements();
  },

  // ===== Floating item helpers =====
  spawnFloating(emoji, type) {
    this.floating.textContent = emoji;
    this.floating.dataset.type = type;
    this.floating.classList.remove('hidden', 'eaten', 'pushed');
    this.floating.classList.add('appear');

    // Position near center bottom of scene
    const scene = document.getElementById('scene');
    const rect = scene.getBoundingClientRect();
    this.floating.style.left = (rect.width / 2 - 30) + 'px';
    this.floating.style.top = (rect.height * 0.55) + 'px';
  },

  clearFloating() {
    this.floating.classList.add('hidden');
    this.floating.classList.remove('appear', 'eaten', 'pushed');
    this.mode = null;
  },

  // ===== Drag logic =====
  bindDrag() {
    const el = this.floating;

    const start = (x, y) => {
      if (this.mode === null) return;
      this.isDragging = true;
      const rect = el.getBoundingClientRect();
      this.dragOffset.x = x - rect.left;
      this.dragOffset.y = y - rect.top;
      el.style.transition = 'none';
    };

    const move = (x, y) => {
      if (!this.isDragging) return;
      const scene = document.getElementById('scene');
      const sRect = scene.getBoundingClientRect();
      let left = x - sRect.left - this.dragOffset.x;
      let top = y - sRect.top - this.dragOffset.y;
      // clamp
      left = Math.max(0, Math.min(left, sRect.width - 60));
      top = Math.max(0, Math.min(top, sRect.height - 60));
      el.style.left = left + 'px';
      el.style.top = top + 'px';

      // Check proximity to cat
      this.checkProximity(left + 30, top + 30);
    };

    const end = () => {
      this.isDragging = false;
      el.style.transition = '';
    };

    // Touch
    el.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      start(t.clientX, t.clientY);
    }, { passive: false });

    el.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      move(t.clientX, t.clientY);
    }, { passive: false });

    el.addEventListener('touchend', end);

    // Mouse
    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      start(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', (e) => move(e.clientX, e.clientY));
    window.addEventListener('mouseup', end);
  },

  checkProximity(fx, fy) {
    const catArea = document.getElementById('catArea');
    const rect = catArea.getBoundingClientRect();
    const scene = document.getElementById('scene');
    const sRect = scene.getBoundingClientRect();

    const catCenterX = rect.left - sRect.left + rect.width / 2;
    const catCenterY = rect.top - sRect.top + rect.height / 2;
    const dist = Math.hypot(fx - catCenterX, fy - catCenterY);

    if (dist < 90) {
      if (this.mode === 'feed') {
        this.onFishFeed();
      } else if (this.mode === 'pillow') {
        this.onPillowPlace();
      } else if (this.mode === 'feather') {
        // Determine zone roughly by relative position
        const relY = (fy - (rect.top - sRect.top)) / rect.height;
        let zone = 'belly';
        if (relY < 0.3) zone = 'ear';
        else if (relY < 0.45) zone = 'nose';
        else if (relY > 0.7) zone = 'paw';
        this.onFeatherTouch(zone);
        // Small cooldown so it doesn't spam
        this.mode = null;
        setTimeout(() => {
          if (this.floating && !this.floating.classList.contains('hidden')) {
            this.mode = 'feather';
          }
        }, 900);
      }
    }
  },

  showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  },

  checkAchievements() {
    const data = Storage.load();
    const show = (id, text) => {
      if (Storage.addAchievement(id)) {
        const el = document.getElementById('achievement');
        document.getElementById('achText').textContent = text;
        el.classList.remove('hidden');
        el.classList.add('show');
        Sounds.happy();
        setTimeout(() => {
          el.classList.remove('show');
          setTimeout(() => el.classList.add('hidden'), 400);
        }, 2500);
      }
    };

    if (data.taps >= 1) show('first_touch', '🐾 প্রথম স্পর্শ!');
    if (data.fishEaten >= 10) show('fish_lover', '🐟 মাছ প্রেমিক!');
    if (data.pillows >= 20) show('sleep_master', '😴 ঘুমের রাজা!');
    if (data.reactions >= 50) show('funny_friend', '😂 মজার বন্ধু!');
  }
};
