// Rendering and input only. All rules live in game.js.
import { createGame, makeMove, isLegalMove, getPlayableBoards, isGameOver } from './game.js';

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const newGameBtn = document.getElementById('new-game');

let state = createGame();

const POSITIONS = ['top-left', 'top-center', 'top-right', 'middle-left', 'center',
  'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'];

// Build the 9x9 grid once; render() only updates classes and text.
for (let b = 0; b < 9; b++) {
  const small = document.createElement('div');
  small.className = 'small-board';
  small.dataset.board = b;
  for (let c = 0; c < 9; c++) {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cell';
    cell.dataset.board = b;
    cell.dataset.cell = c;
    small.appendChild(cell);
  }
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  small.appendChild(overlay);
  boardEl.appendChild(small);
}

boardEl.addEventListener('click', (e) => {
  const cell = e.target.closest('.cell');
  if (!cell) return;
  const b = Number(cell.dataset.board);
  const c = Number(cell.dataset.cell);
  if (!isLegalMove(state, b, c)) return; // ignore illegal clicks
  state = makeMove(state, b, c);
  render();
});

newGameBtn.addEventListener('click', () => {
  state = createGame();
  render();
});

function render() {
  const playable = new Set(getPlayableBoards(state));

  boardEl.querySelectorAll('.small-board').forEach((small) => {
    const b = Number(small.dataset.board);
    const status = state.boardStatus[b];
    small.classList.toggle('playable', playable.has(b));
    small.classList.toggle('won-x', status === 'X');
    small.classList.toggle('won-o', status === 'O');
    small.classList.toggle('drawn', status === 'draw');
    small.querySelector('.overlay').textContent = status === 'draw' ? 'Draw' : (status ?? '');

    small.querySelectorAll('.cell').forEach((cellEl) => {
      const c = Number(cellEl.dataset.cell);
      const v = state.cells[b][c];
      cellEl.textContent = v ?? '';
      cellEl.classList.toggle('x', v === 'X');
      cellEl.classList.toggle('o', v === 'O');
      const last = state.lastMove && state.lastMove.board === b && state.lastMove.cell === c;
      cellEl.classList.toggle('last', !!last);
      const legal = isLegalMove(state, b, c);
      cellEl.disabled = !legal;
      cellEl.setAttribute('aria-label', `${POSITIONS[b]} board, ${POSITIONS[c]} cell: ${v ?? 'empty'}`);
    });
  });

  boardEl.classList.toggle('turn-x', state.currentPlayer === 'X' && !isGameOver(state));
  boardEl.classList.toggle('turn-o', state.currentPlayer === 'O' && !isGameOver(state));

  if (state.winner) {
    statusEl.innerHTML = `<span class="${state.winner.toLowerCase()}">${state.winner}</span> wins!`;
  } else if (state.isDraw) {
    statusEl.textContent = "It's a draw.";
  } else {
    const where = state.activeBoard === null ? 'any open board' : `the ${POSITIONS[state.activeBoard]} board`;
    statusEl.innerHTML = `<span class="${state.currentPlayer.toLowerCase()}">${state.currentPlayer}</span> to move, play in ${where}`;
  }
}

render();
