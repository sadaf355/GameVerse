document.addEventListener('DOMContentLoaded', () => {
  const boxes = document.querySelectorAll(".ttt-cell");
  const resetBtn = document.querySelector("#ttt-restart-btn");
  const statusEl = document.querySelector("#ttt-status");
  const scoreXEl = document.querySelector("#ttt-score-x");
  const scoreOEl = document.querySelector("#ttt-score-o");
  const scoreTiesEl = document.querySelector("#ttt-score-ties");

  let turnO = false; // Player X starts
  let count = 0; // Track Draw
  let isGameActive = true;
  const scores = { x: 0, o: 0, ties: 0 };

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  const resetGame = () => {
    turnO = false;
    count = 0;
    isGameActive = true;
    enableBoxes();
    updateStatus();
  };

  const disableBoxes = () => {
    boxes.forEach(box => box.disabled = true);
  };

  const enableBoxes = () => {
    boxes.forEach(box => {
      box.disabled = false;
      box.innerText = "";
      box.classList.remove("x", "o");
    });
  };

  const showWinner = (winner) => {
    isGameActive = false;
    if (statusEl) statusEl.innerText = `🎉 Congratulations, Winner is ${winner}`;
    if (winner === "X") {
      scores.x++;
      if (scoreXEl) scoreXEl.innerText = scores.x;
    } else {
      scores.o++;
      if (scoreOEl) scoreOEl.innerText = scores.o;
    }
    disableBoxes();
  };

  const checkWinner = () => {
    for (let pattern of winPatterns) {
      let pos1Val = boxes[pattern[0]].innerText;
      let pos2Val = boxes[pattern[1]].innerText;
      let pos3Val = boxes[pattern[2]].innerText;

      if (pos1Val !== "" && pos2Val !== "" && pos3Val !== "") {
        if (pos1Val === pos2Val && pos2Val === pos3Val) {
          showWinner(pos1Val);
          return true;
        }
      }
    }
    return false;
  };

  const gameDraw = () => {
    isGameActive = false;
    if (statusEl) statusEl.innerText = `🤝 Game was a Draw.`;
    scores.ties++;
    if (scoreTiesEl) scoreTiesEl.innerText = scores.ties;
    disableBoxes();
  };

  const updateStatus = () => {
    if (statusEl) statusEl.innerText = `Player ${turnO ? 'O' : 'X'}'s Turn`;
  };

  boxes.forEach((box) => {
    box.addEventListener("click", () => {
      if (!isGameActive || box.innerText !== "") return;
      if (turnO) {
        box.innerText = "O";
        box.classList.add("o");
        turnO = false;
      } else {
        box.innerText = "X";
        box.classList.add("x");
        turnO = true;
      }
      box.disabled = true;
      count++;

      const isWinner = checkWinner();
      if (count === 9 && !isWinner) {
        gameDraw();
      } else if (!isWinner) {
        updateStatus();
      }
    });
  });

  if (resetBtn) resetBtn.addEventListener("click", resetGame);
  
  updateStatus();
});
