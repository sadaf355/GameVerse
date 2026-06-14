/**
 * GameVerse Master Application Initializer (Updated)
 * Orchestrates event listeners, theme togglers, stats renderers,
 * and handles onboarding prompts.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize subsystems
  window.GameWheel.init();

  // Set up DOM references
  const usernameModal = document.getElementById('username-modal');
  const usernameForm = document.getElementById('username-form');
  const usernameInput = document.getElementById('username-input');
  
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  
  const burgerMenu = document.getElementById('burger-menu');
  const navMenu = document.getElementById('nav-menu');
  
  const editUsernameBtn = document.getElementById('edit-username-btn');
  const resetProfileBtn = document.getElementById('reset-profile-btn');

  // --- 1. USER ONBOARDING MODAL FLOW ---
  if (usernameModal && !window.GameState.username) {
    usernameModal.classList.add('show');
  }

  if (usernameForm && usernameInput) {
    usernameForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = usernameInput.value.trim();
      if (name) {
        window.GameState.setUsername(name);
        if (usernameModal) usernameModal.classList.remove('show');
        window.GameState.playAchievementSound();
      }
    });
  }





  // --- 5. GLOBAL STATE UI BINDER ---
  window.GameState.onUpdate(() => {
    const name = window.GameState.username || 'User';
    const avatarChar = name.charAt(0).toUpperCase();
    
    document.getElementById('nav-username').textContent = name;
    document.getElementById('nav-avatar').textContent = avatarChar;
    
    // Update theme toggle button icon
    if (themeToggleBtn) {
      themeToggleBtn.textContent = window.GameState.themeMode === 'dark' ? '☀️' : '🌙';
    }
    
    // Redraw wheel segments
    if (window.GameWheel && typeof window.GameWheel.drawWheel === 'function') {
      window.GameWheel.drawWheel();
    }
  });

  // Trigger initial updates
  window.GameState.triggerUpdate();

  // --- 6. DYNAMIC UI RENDERERS ---

  // Game data dictionary
  const gamesData = [
    { id: 'tictactoe', name: 'Tic Tac Toe', icon: '❌', diff: 'Easy', desc: 'Outsmart the computer AI or challenge a friend in local PvP mode!' },
    { id: 'connectfour', name: 'Connect Four', icon: '🔴', diff: 'Medium', desc: 'Drop tokens into columns to connect 4 of your color in a row, column, or diagonal!' },
    { id: 'memory', name: 'Memory Match', icon: '🧠', diff: 'Medium', desc: 'Flip and pair matching blocks. Beat the clock at higher difficulties!' }
  ];

  // Helper to render card templates
  const makeGameCard = (game) => {
    let highscoreText = 'None';
    
    if (game.id === 'connectfour') {
      highscoreText = `${window.GameState.stats.connectfourWins} Wins`;
    } else if (game.id === 'memory') {
      const best = window.GameState.stats.memoryBestTime;
      highscoreText = best ? `${best}s` : 'None';
    } else if (game.id === 'tictactoe') {
      highscoreText = `${window.GameState.stats.tictactoeWins} Wins`;
    }

    return `
      <div class="card game-showcase-card">
        <span class="game-card-icon">${game.icon}</span>
        <h3 class="game-card-title">${game.name}</h3>
        <p class="game-card-desc">${game.desc}</p>
        <div class="game-card-meta">
          <span class="game-card-difficulty">Diff: ${game.diff}</span>
          <span class="game-card-highscore">Best: ${highscoreText}</span>
        </div>
        <a href="${game.id}.html" class="btn btn-primary" style="margin-top: auto;">Play Now</a>
      </div>
    `;
  };

  // Render showcase cards in home view (top 3 games)
  const homeShowcase = document.getElementById('home-games-showcase');
  if (homeShowcase) {
    homeShowcase.innerHTML = gamesData.slice(0, 3).map(makeGameCard).join('');
  }

  // Render games gallery page
  window.renderGamesListPage = () => {
    const listEl = document.getElementById('games-gallery-list');
    if (listEl) {
      listEl.innerHTML = gamesData.map(makeGameCard).join('');
    }
  };

  // Render player profile dashboard page
  window.renderProfileDashboard = () => {
    const stats = window.GameState.stats;
    const name = window.GameState.username || 'Gamer';
    
    document.getElementById('profile-name').textContent = name;
    document.getElementById('profile-avatar').textContent = name.charAt(0).toUpperCase();
    document.getElementById('prof-played').textContent = stats.gamesPlayed;
    document.getElementById('prof-wins').textContent = stats.wins;
    document.getElementById('prof-losses').textContent = stats.losses;

    // Set records values
    const tttRecordEl = document.getElementById('record-tictactoe');
    const c4RecordEl = document.getElementById('record-connectfour');
    const memRecordEl = document.getElementById('record-memory');
    
    if (tttRecordEl) tttRecordEl.textContent = `${stats.tictactoeWins || 0} Wins`;
    if (c4RecordEl) c4RecordEl.textContent = `${stats.connectfourWins || 0} Wins`;
    if (memRecordEl) memRecordEl.textContent = stats.memoryBestTime ? `${stats.memoryBestTime}s` : '--';

    // Render achievements list
    const unlockCountEl = document.getElementById('achievements-unlocked-count');
    const achievementsListEl = document.getElementById('profile-achievements-list');
    
    if (unlockCountEl && achievementsListEl) {
      unlockCountEl.textContent = window.GameState.unlockedAchievements.length;
      
      achievementsListEl.innerHTML = window.GameState.achievementsList.map(ach => {
        const isUnlocked = window.GameState.unlockedAchievements.includes(ach.id);
        return `
          <div class="achievement-card ${isUnlocked ? 'unlocked' : ''}">
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-info">
              <span class="achievement-title">${ach.title}</span>
              <span class="achievement-desc">${ach.desc}</span>
            </div>
          </div>
        `;
      }).join('');
    }
  };
});
