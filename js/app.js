/**
 * GameVerse Master Application Initializer
 * Orchestrates theme toggling, responsive hamburger menu,
 * and dynamic home showcase cards rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. GAME WHEEL INITIALIZATION ---
  if (window.GameWheel && typeof window.GameWheel.init === 'function') {
    window.GameWheel.init();
  }

  // --- 2. STANDALONE THEME TOGGLER ---
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  
  const applyThemeMode = (mode) => {
    document.body.className = '';
    document.body.classList.add(`theme-${mode}`);
    localStorage.setItem('gv_theme_mode', mode);
    if (themeToggleBtn) {
      themeToggleBtn.textContent = mode === 'dark' ? '☀️' : '🌙';
    }
  };

  const currentTheme = localStorage.getItem('gv_theme_mode') || 'dark';
  applyThemeMode(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const mode = localStorage.getItem('gv_theme_mode') || 'dark';
      const nextMode = mode === 'dark' ? 'light' : 'dark';
      applyThemeMode(nextMode);
    });
  }

  // --- 3. RESPONSIVE HAMBURGER MENU ---
  const burgerMenu = document.getElementById('burger-menu');
  const navMenu = document.getElementById('nav-menu');
  if (burgerMenu && navMenu) {
    burgerMenu.addEventListener('click', () => {
      burgerMenu.classList.toggle('active');
      navMenu.classList.toggle('open');
    });
  }

  // --- 4. DYNAMIC SHOWCASE CARDS ---
  const gamesData = [
    { id: 'tictactoe', name: 'Tic Tac Toe', icon: '❌', desc: 'Outsmart the computer AI or challenge a friend in local PvP mode!' },
    { id: 'connectfour', name: 'Connect Four', icon: '🔴', desc: 'Drop tokens into columns to connect 4 of your color in a row, column, or diagonal!' },
    { id: 'memory', name: 'Memory Match', icon: '🧠', desc: 'Flip and pair matching blocks. Beat the clock at higher difficulties!' }
  ];

  const makeGameCard = (game) => {
    return `
      <div class="card game-showcase-card">
        <span class="game-card-icon">${game.icon}</span>
        <h3 class="game-card-title">${game.name}</h3>
        <p class="game-card-desc">${game.desc}</p>
        <a href="${game.id}.html" class="btn btn-primary" style="margin-top: auto;">Play Now</a>
      </div>
    `;
  };

  const homeShowcase = document.getElementById('home-games-showcase');
  if (homeShowcase) {
    homeShowcase.innerHTML = gamesData.map(makeGameCard).join('');
  }
});
