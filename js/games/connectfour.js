document.addEventListener('DOMContentLoaded', () => {
  const boardEl = document.querySelector('#c4-board');
  const headerEl = document.querySelector('#c4-board-header');
  const restartBtn = document.querySelector('#c4-restart-btn');
  const statusEl = document.querySelector('#c4-status');
  const scoreRedEl = document.querySelector('#c4-score-red');
  const scoreYellowEl = document.querySelector('#c4-score-yellow');
  const scoreTiesEl = document.querySelector('#c4-score-ties');

  let board = Array(6).fill(null).map(() => Array(7).fill(null));
  let currentPlayer = 'red';
  let isGameActive = true;
  const scores = { red: 0, yellow: 0, ties: 0 };

  const resetGame = () => {
    board = Array(6).fill(null).map(() => Array(7).fill(null));
    currentPlayer = 'red';
    isGameActive = true;
    
    // Clear display tokens
    if (boardEl) {
      const tokens = boardEl.querySelectorAll('.c4-token');
      tokens.forEach(token => token.remove());

      const winners = boardEl.querySelectorAll('.winner-glow');
      winners.forEach(winner => winner.classList.remove('winner-glow'));
    }

    updateStatus();
  };

  const handleDrop = (colIdx) => {
    if (!isGameActive) return;
    
    // Find lowest empty row in column
    let rowIdx = -1;
    for (let r = 5; r >= 0; r--) {
      if (board[r][colIdx] === null) {
        rowIdx = r;
        break;
      }
    }

    if (rowIdx === -1) return; // Column full

    board[rowIdx][colIdx] = currentPlayer;

    if (boardEl) {
      const cell = boardEl.querySelector(`.c4-cell[data-row="${rowIdx}"][data-col="${colIdx}"]`);
      if (cell) {
        const hole = cell.querySelector('.c4-hole');
        if (hole) {
          hole.innerHTML = `<div class="c4-token ${currentPlayer} c4-drop-r${rowIdx}"></div>`;
        }
      }
    }

    playDropSound();

    const winResult = checkWin();
    if (winResult) {
      endGame('win', winResult.cells);
    } else if (board[0].every(cell => cell !== null)) {
      endGame('tie');
    } else {
      currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
      updateStatus();
    }
  };

  const checkWin = () => {
    const player = currentPlayer;

    // Horizontal
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === player && board[r][c+1] === player && board[r][c+2] === player && board[r][c+3] === player) {
          return { cells: [[r, c], [r, c+1], [r, c+2], [r, c+3]] };
        }
      }
    }

    // Vertical
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 7; c++) {
        if (board[r][c] === player && board[r+1][c] === player && board[r+2][c] === player && board[r+3][c] === player) {
          return { cells: [[r, c], [r+1, c], [r+2, c], [r+3, c]] };
        }
      }
    }

    // Diagonal Down-Right
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === player && board[r+1][c+1] === player && board[r+2][c+2] === player && board[r+3][c+3] === player) {
          return { cells: [[r, c], [r+1, c+1], [r+2, c+2], [r+3, c+3]] };
        }
      }
    }

    // Diagonal Up-Right
    for (let r = 3; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === player && board[r-1][c+1] === player && board[r-2][c+2] === player && board[r-3][c+3] === player) {
          return { cells: [[r, c], [r-1, c+1], [r-2, c+2], [r-3, c+3]] };
        }
      }
    }

    return null;
  };

  const updateStatus = () => {
    if (!statusEl) return;
    statusEl.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
    statusEl.style.color = currentPlayer === 'red' ? '#ff4444' : '#ffeb3b';
  };

  const endGame = (result, winCells = []) => {
    isGameActive = false;

    if (result === 'win') {
      if (boardEl) {
        winCells.forEach(([r, c]) => {
          const cell = boardEl.querySelector(`.c4-cell[data-row="${r}"][data-col="${c}"]`);
          if (cell) {
            const token = cell.querySelector('.c4-token');
            if (token) token.classList.add('winner-glow');
          }
        });
      }

      if (currentPlayer === 'red') {
        scores.red++;
        if (statusEl) {
          statusEl.textContent = '🔴 RED WINS THE MATCH!';
          statusEl.style.color = '#ff4444';
        }
      } else {
        scores.yellow++;
        if (statusEl) {
          statusEl.textContent = '🟡 YELLOW WINS THE MATCH!';
          statusEl.style.color = '#ffeb3b';
        }
      }
      window.GameState.recordWin('connectfour', { vs: 'pvp', result: 'win' });
    } else {
      scores.ties++;
      if (statusEl) {
        statusEl.textContent = "🤝 It's a Tie Grid!";
        statusEl.style.color = 'var(--text-color)';
      }
    }

    if (scoreRedEl) scoreRedEl.textContent = scores.red;
    if (scoreYellowEl) scoreYellowEl.textContent = scores.yellow;
    if (scoreTiesEl) scoreTiesEl.textContent = scores.ties;
  };

  const playDropSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch(e) {}
  };

  if (headerEl) {
    headerEl.addEventListener('click', (e) => {
      const ind = e.target.closest('.c4-drop-indicator');
      if (ind) handleDrop(parseInt(ind.getAttribute('data-col')));
    });
  }

  if (boardEl) {
    boardEl.addEventListener('click', (e) => {
      const cell = e.target.closest('.c4-cell');
      if (cell) handleDrop(parseInt(cell.getAttribute('data-col')));
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', resetGame);
  }

  updateStatus();
});
