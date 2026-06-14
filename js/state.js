/**
 * GameVerse Global State Management
 * Handles Light/Dark Glassmorphic modes, achievements, statistics,
 * and unified navbar UI bindings across all multi-page entry points.
 */

window.GameState = {
  username: null,
  themeMode: 'dark', // 'dark' or 'light'
  stats: {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    tictactoeWins: 0,
    connectfourWins: 0,
    memoryBestTime: null
  },
  unlockedAchievements: [],
  
  achievementsList: [
    { id: 'first_victory', title: 'First Victory', desc: 'Win your first match!', icon: '🏆' },
    { id: 'games_10', title: '10 Games Played', desc: 'Complete a total of 10 game matches!', icon: '🎮' },
    { id: 'c4_master', title: 'Connect Master', desc: 'Win a Connect Four match vs CPU!', icon: '🔴' },
    { id: 'memory_master', title: 'Memory Master', desc: 'Complete Memory Match in under 45 seconds!', icon: '🧠' }
  ],

  setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/;SameSite=Strict";
  },

  getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(cname) == 0) {
        return c.substring(cname.length, c.length);
      }
    }
    return null;
  },

  eraseCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  },

  init() {
    this.load();
    this.applyThemeMode(this.themeMode);
    
    // Bind universal navbar elements on load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.bindGlobalUI());
    } else {
      this.bindGlobalUI();
    }
  },

  load() {
    this.username = this.getCookie('gv_username') || null;
    this.themeMode = localStorage.getItem('gv_theme_mode') || 'dark';
    
    const savedStats = localStorage.getItem('gv_stats');
    if (savedStats) {
      try {
        this.stats = { ...this.stats, ...JSON.parse(savedStats) };
      } catch (e) {
        console.error('Error parsing stats', e);
      }
    }
    
    const savedAchievements = localStorage.getItem('gv_achievements');
    if (savedAchievements) {
      try {
        this.unlockedAchievements = JSON.parse(savedAchievements);
      } catch (e) {
        console.error('Error parsing achievements', e);
      }
    }
  },

  save() {
    if (this.username) {
      this.setCookie('gv_username', this.username, 365);
    } else {
      this.eraseCookie('gv_username');
    }
    localStorage.setItem('gv_theme_mode', this.themeMode);
    localStorage.setItem('gv_stats', JSON.stringify(this.stats));
    localStorage.setItem('gv_achievements', JSON.stringify(this.unlockedAchievements));
  },

  setUsername(name) {
    this.username = name ? name.trim() : 'Player';
    this.save();
    this.syncNavbarUI();
    this.triggerUpdate();
  },

  applyThemeMode(mode) {
    this.themeMode = mode;
    document.body.className = '';
    document.body.classList.add(`theme-${mode}`);
    localStorage.setItem('gv_theme_mode', this.themeMode);
    this.syncNavbarUI();
    this.triggerUpdate();
  },

  toggleThemeMode() {
    const nextMode = this.themeMode === 'dark' ? 'light' : 'dark';
    this.applyThemeMode(nextMode);
  },

  bindGlobalUI() {
    // Theme toggle bind
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleThemeMode());
    }

    // On mobile screens, hamburger menus binds
    const burgerMenu = document.getElementById('burger-menu');
    const navMenu = document.getElementById('nav-menu');
    if (burgerMenu && navMenu) {
      burgerMenu.addEventListener('click', () => {
        burgerMenu.classList.toggle('active');
        navMenu.classList.toggle('open');
      });
    }

    // Onboarding Username edit bind
    const editUsernameBtn = document.getElementById('edit-username-btn');
    if (editUsernameBtn) {
      editUsernameBtn.addEventListener('click', () => {
        const newName = prompt('Enter a new gaming tag:', this.username);
        if (newName !== null && newName.trim() !== '') {
          this.setUsername(newName);
        }
      });
    }

    // Profile data reset bind
    const resetProfileBtn = document.getElementById('reset-profile-btn');
    if (resetProfileBtn) {
      resetProfileBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all your stats, records, and unlocked achievements? This cannot be undone.')) {
          localStorage.clear();
          this.eraseCookie('gv_username');
          window.location.reload();
        }
      });
    }

    this.syncNavbarUI();
  },

  syncNavbarUI() {
    const name = this.username || 'User';
    const avatarChar = name.charAt(0).toUpperCase();
    
    const userEl = document.getElementById('nav-username');
    const avatarEl = document.getElementById('nav-avatar');
    const toggleBtn = document.getElementById('theme-toggle-btn');
    
    if (userEl) userEl.textContent = name;
    if (avatarEl) avatarEl.textContent = avatarChar;
    if (toggleBtn) {
      toggleBtn.textContent = this.themeMode === 'dark' ? '☀️' : '🌙';
    }
  },

  recordGamePlay(gameName) {
    this.stats.gamesPlayed++;
    this.save();
    this.checkAchievements();
    this.triggerUpdate();
  },

  recordWin(gameName, details = {}) {
    this.stats.wins++;
    
    if (gameName === 'tictactoe') {
      this.stats.tictactoeWins++;
    } else if (gameName === 'connectfour') {
      this.stats.connectfourWins++;
    }
    
    this.save();
    this.checkAchievements(gameName, details);
    this.triggerUpdate();
  },

  recordLoss() {
    this.stats.losses++;
    this.save();
    this.triggerUpdate();
  },

  updateScore(gameName, score, details = {}) {
    let isNewHigh = false;
    
    if (gameName === 'memory') {
      const seconds = details.seconds;
      if (!this.stats.memoryBestTime || seconds < this.stats.memoryBestTime) {
        this.stats.memoryBestTime = seconds;
        isNewHigh = true;
      }
    }
    
    this.save();
    this.checkAchievements(gameName, { score, ...details });
    this.triggerUpdate();
    return isNewHigh;
  },

  checkAchievements(currentGame, details = {}) {
    if (this.stats.wins > 0 && !this.unlockedAchievements.includes('first_victory')) {
      this.unlockAchievement('first_victory');
    }

    if (this.stats.gamesPlayed >= 10 && !this.unlockedAchievements.includes('games_10')) {
      this.unlockAchievement('games_10');
    }

    if (currentGame === 'connectfour' && details.vs === 'computer' && details.result === 'win') {
      this.unlockAchievement('c4_master');
    }

    if (this.stats.memoryBestTime && this.stats.memoryBestTime < 45 && !this.unlockedAchievements.includes('memory_master')) {
      this.unlockAchievement('memory_master');
    }
  },

  unlockAchievement(id) {
    if (this.unlockedAchievements.includes(id)) return;
    
    this.unlockedAchievements.push(id);
    this.save();
    
    const achievement = this.achievementsList.find(a => a.id === id);
    if (achievement) {
      this.showAchievementNotification(achievement);
    }
  },

  showAchievementNotification(achievement) {
    const banner = document.getElementById('achievement-banner');
    if (!banner) return;
    
    const iconEl = banner.querySelector('.achievement-banner-icon');
    const titleEl = banner.querySelector('.achievement-banner-title');
    const descEl = banner.querySelector('.achievement-banner-desc');
    
    if (iconEl && titleEl && descEl) {
      iconEl.textContent = achievement.icon;
      titleEl.textContent = achievement.title;
      descEl.textContent = achievement.desc;
      
      this.playAchievementSound();
      
      banner.classList.add('show');
      
      setTimeout(() => {
        banner.classList.remove('show');
      }, 4000);
    }
  },

  playAchievementSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = audioCtx.currentTime + index * 0.12;
        const duration = 0.3;
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      });
    } catch (e) {
      console.log('Web Audio Context blocked or unsupported.', e);
    }
  },

  listeners: [],
  onUpdate(callback) {
    this.listeners.push(callback);
  },
  triggerUpdate() {
    this.listeners.forEach(cb => cb());
  }
};

// Auto-initialize GameState on page load so theme states align across all entry points
window.GameState.init();
