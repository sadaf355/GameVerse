document.addEventListener('DOMContentLoaded', () => {
  const gridEl = document.querySelector('#memory-grid');
  const restartBtn = document.querySelector('#mem-restart-btn');
  const btnEasy = document.querySelector('#mem-diff-easy');
  const btnMed = document.querySelector('#mem-diff-med');
  const btnHard = document.querySelector('#mem-diff-hard');
  const movesEl = document.querySelector('#mem-moves');
  const timeEl = document.querySelector('#mem-time');
  const recordEl = document.querySelector('#mem-record');

  let difficulty = 'medium'; // 'easy', 'medium', 'hard'
  let cards = [];
  let selectedCards = [];
  let moves = 0;
  let timerInterval = null;
  let seconds = 0;
  let timerStarted = false;
  let isLockout = false;

  const symbols = ['👾', '🚀', '💎', '👑', '⚡', '🍀', '🍎', '🍌', '🥑', '🥥', '🎈', '🌋'];

  const initGame = () => {
    selectedCards = [];
    moves = 0;
    seconds = 0;
    timerStarted = false;
    isLockout = false;
    if (timerInterval) clearInterval(timerInterval);
    
    if (movesEl) movesEl.textContent = '0';
    if (timeEl) timeEl.textContent = '0s';
    
    updateRecordDisplay();
    updateDifficultyButtons();
    generateCards();
  };

  const updateRecordDisplay = () => {
    if (recordEl) {
      const bestTime = window.GameState.stats.memoryBestTime;
      recordEl.textContent = bestTime ? `${bestTime}s` : 'None';
    }
  };

  const updateDifficultyButtons = () => {
    if (btnEasy && btnMed && btnHard) {
      btnEasy.className = `btn ${difficulty === 'easy' ? 'btn-primary' : 'btn-secondary'}`;
      btnMed.className = `btn ${difficulty === 'medium' ? 'btn-primary' : 'btn-secondary'}`;
      btnHard.className = `btn ${difficulty === 'hard' ? 'btn-primary' : 'btn-secondary'}`;
    }

    if (gridEl) {
      gridEl.className = `memory-grid memory-grid-${difficulty}`;
    }
  };

  const generateCards = () => {
    if (!gridEl) return;
    
    let pairCount = 8;
    if (difficulty === 'easy') pairCount = 6;
    if (difficulty === 'hard') pairCount = 12;

    const gameSymbols = symbols.slice(0, pairCount);
    const doubleSymbols = shuffle([...gameSymbols, ...gameSymbols]);

    gridEl.innerHTML = doubleSymbols.map((symbol, idx) => `
      <div class="memory-card" data-index="${idx}" data-symbol="${symbol}">
        <div class="memory-card-face memory-card-back">?</div>
        <div class="memory-card-face memory-card-front">${symbol}</div>
      </div>
    `).join('');

    cards = Array.from(gridEl.querySelectorAll('.memory-card'));
  };

  const handleCardClick = (card) => {
    if (!timerStarted) {
      startTimer();
    }

    card.classList.add('flipped');
    selectedCards.push(card);

    if (selectedCards.length === 2) {
      moves++;
      if (movesEl) movesEl.textContent = moves;
      checkPair();
    }
  };

  const checkPair = () => {
    const [card1, card2] = selectedCards;
    const symbol1 = card1.getAttribute('data-symbol');
    const symbol2 = card2.getAttribute('data-symbol');

    if (symbol1 === symbol2) {
      card1.classList.add('matched');
      card2.classList.add('matched');
      selectedCards = [];

      if (cards.every(c => c.classList.contains('matched'))) {
        endGame();
      }
    } else {
      isLockout = true;
      setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        selectedCards = [];
        isLockout = false;
      }, 1000);
    }
  };

  const startTimer = () => {
    timerStarted = true;
    seconds = 0;
    timerInterval = setInterval(() => {
      seconds++;
      if (timeEl) timeEl.textContent = `${seconds}s`;
    }, 1000);
  };

  const endGame = () => {
    clearInterval(timerInterval);
    
    const isNewHigh = window.GameState.updateScore('memory', seconds, { 
      moves: moves,
      seconds: seconds
    });
    
    window.GameState.recordWin('memory');

    if (gridEl) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; animation: slideInUp 0.3s;">
          <h2 style="color: var(--accent-color); font-family: var(--font-heading); font-size: 2.2rem; margin-bottom: 12px;">🎉 Board Completed!</h2>
          <p style="margin-bottom: 8px;">Completed in <strong>${moves}</strong> moves.</p>
          <p style="margin-bottom: 24px;">Time: <strong>${seconds}</strong> seconds ${isNewHigh ? '<span style="color: var(--accent-tertiary); font-weight:800;">(NEW RECORD!)</span>' : ''}</p>
          <button id="mem-play-again" class="btn btn-primary">Play Again</button>
        </div>
      `;
      const playAgainBtn = gridEl.querySelector('#mem-play-again');
      if (playAgainBtn) {
        playAgainBtn.addEventListener('click', initGame);
      }
    }
  };

  const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  if (gridEl) {
    gridEl.addEventListener('click', (e) => {
      const card = e.target.closest('.memory-card');
      if (!card || card.classList.contains('flipped') || card.classList.contains('matched') || isLockout) return;
      handleCardClick(card);
    });
  }

  if (restartBtn) restartBtn.addEventListener('click', initGame);
  if (btnEasy) btnEasy.addEventListener('click', () => { difficulty = 'easy'; initGame(); });
  if (btnMed) btnMed.addEventListener('click', () => { difficulty = 'medium'; initGame(); });
  if (btnHard) btnHard.addEventListener('click', () => { difficulty = 'hard'; initGame(); });

  // Initialize
  initGame();
  
  // Update record display if stats update
  window.GameState.onUpdate(updateRecordDisplay);
});
