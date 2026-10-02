// Ultimate Tic-Tac-Toe: pure game logic. No DOM access, so it can be tested in Node.
//
// Boards and cells are both indexed 0-8, left to right, top to bottom:
//   0 1 2
//   3 4 5
//   6 7 8

export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],            // diagonals
];

// Returns 'X' or 'O' if that player has three in a row in `squares`, else null.
export function lineWinner(squares) {
  for (const [a, b, c] of LINES) {
    const v = squares[a];
    if ((v === 'X' || v === 'O') && v === squares[b] && v === squares[c]) return v;
  }
  return null;
}

export function createGame() {
  return {
    cells: Array.from({ length: 9 }, () => Array(9).fill(null)), // cells[board][cell]
    boardStatus: Array(9).fill(null), // null (open), 'X', 'O', or 'draw'
    currentPlayer: 'X',
    activeBoard: null, // board the current player must play in; null = free choice
    winner: null,      // 'X' or 'O' once the game is won
    isDraw: false,
    lastMove: null,    // { board, cell }
  };
}

export function isGameOver(state) {
  return state.winner !== null || state.isDraw;
}

// A board can be played in if it is not won or drawn.
export function isBoardOpen(state, board) {
  return state.boardStatus[board] === null;
}

// Boards the current player may play in right now.
export function getPlayableBoards(state) {
  if (isGameOver(state)) return [];
  if (state.activeBoard !== null) return [state.activeBoard];
  return [...Array(9).keys()].filter((b) => isBoardOpen(state, b));
}

export function getLegalMoves(state) {
  const moves = [];
  for (const board of getPlayableBoards(state)) {
    state.cells[board].forEach((v, cell) => {
      if (v === null) moves.push({ board, cell });
    });
  }
  return moves;
}

export function isLegalMove(state, board, cell) {
  return getLegalMoves(state).some((m) => m.board === board && m.cell === cell);
}

// Returns a NEW state; the input is never mutated. Throws on an illegal move.
export function makeMove(state, board, cell) {
  if (!isLegalMove(state, board, cell)) {
    throw new Error(`Illegal move: board ${board}, cell ${cell}`);
  }
  const player = state.currentPlayer;

  const cells = state.cells.map((b) => b.slice());
  cells[board][cell] = player;

  const boardStatus = state.boardStatus.slice();
  const smallWinner = lineWinner(cells[board]);
  if (smallWinner) boardStatus[board] = smallWinner;
  else if (cells[board].every((v) => v !== null)) boardStatus[board] = 'draw';

  // Drawn boards count for nobody, so only 'X'/'O' entries can make a line.
  const winner = lineWinner(boardStatus);

  // The opponent must play on the SAME board that was just played on.
  // If that board is now won or full, the opponent gets a free choice
  // of any open board (activeBoard = null).
  const activeBoard = boardStatus[board] === null ? board : null;

  const next = {
    cells,
    boardStatus,
    currentPlayer: player === 'X' ? 'O' : 'X',
    activeBoard: winner ? null : activeBoard,
    winner,
    isDraw: false,
    lastMove: { board, cell },
  };
  // No winner and no legal moves left: the game is a draw.
  if (!winner && getLegalMoves(next).length === 0) next.isDraw = true;
  return next;
}
