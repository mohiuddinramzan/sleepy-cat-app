/**
 * LocalStorage helper for Sleepy Cat App
 */
const Storage = {
  KEY: 'sleepyCat_v1',

  defaults: {
    taps: 0,
    fishEaten: 0,
    reactions: 0,
    pillows: 0,
    sound: true,
    music: false,
    vibrate: true,
    night: false,
    achievements: [],
    firstTouch: false,
    totalSessions: 0
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return { ...this.defaults };
      return { ...this.defaults, ...JSON.parse(raw) };
    } catch (e) {
      return { ...this.defaults };
    }
  },

  save(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  },

  update(partial) {
    const data = this.load();
    Object.assign(data, partial);
    this.save(data);
    return data;
  },

  increment(key, amount = 1) {
    const data = this.load();
    data[key] = (data[key] || 0) + amount;
    this.save(data);
    return data[key];
  },

  addAchievement(id) {
    const data = this.load();
    if (!data.achievements.includes(id)) {
      data.achievements.push(id);
      this.save(data);
      return true; // newly unlocked
    }
    return false;
  },

  hasAchievement(id) {
    return this.load().achievements.includes(id);
  }
};
