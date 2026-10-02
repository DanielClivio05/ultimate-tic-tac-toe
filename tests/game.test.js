import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createGame, makeMove, getLegalMoves, getPlayableBoards, isLegalMove, lineWinner,
} from '../game.js';

// Play a list of [board, cell] moves from a fresh game.
const play = (moves, state = createGame()) =>
  moves.reduce((s, [b, c]) => makeMove(s, b, c), state);

test('new game: X to move, free choice, 81 legal moves', () => {
  const s = createGame();
  assert.equal(s.currentPlayer, 'X');
  assert.equal(s.activeBoard, null);
  assert.equal(getLegalMoves(s).length, 81);
});

test('first move can be anywhere', () => {
  for (const [b, c] of [[0, 0], [4, 4], [8, 8], [2, 6]]) {
    const s = makeMove(createGame(), b, c);
    assert.equal(s.cells[b][c], 'X');
  }
});

test('next player must play on the same board', () => {
  const s = play([[4, 2]]); // X plays on the center board
  assert.equal(s.currentPlayer, 'O');
  assert.equal(s.activeBoard, 4);
  assert.deepEqual(getPlayableBoards(s), [4]);
  assert.ok(getLegalMoves(s).every((m) => m.board === 4));
});

test('play stays on the same board across several moves', () => {
  const s = play([[6, 0], [6, 4], [6, 8], [6, 1]]);
  assert.equal(s.activeBoard, 6);
  assert.equal(isLegalMove(s, 2, 0), false);
});

test('rejects illegal moves: wrong board, occupied cell, out of range', () => {
  const s = play([[4, 2]]);
  assert.throws(() => makeMove(s, 0, 0), /Illegal/); // must play in board 4
  const t = play([[4, 4]]); // O must play in board 4
  assert.throws(() => makeMove(t, 4, 4), /Illegal/); // occupied
  assert.throws(() => makeMove(createGame(), 9, 0), /Illegal/);
});

test('makeMove does not mutate the previous state', () => {
  const s = createGame();
  makeMove(s, 0, 0);
  assert.equal(s.cells[0][0], null);
  assert.equal(s.currentPlayer, 'X');
});

test('winning a small board claims it', () => {
  // Both players stay on board 0; X completes the 0-4-8 diagonal.
  const s = play([[0, 4], [0, 1], [0, 8], [0, 2], [0, 0]]);
  assert.equal(s.boardStatus[0], 'X');
  assert.equal(s.winner, null);
});

test('cannot play on a board that is already won', () => {
  const s = play([[0, 4], [0, 1], [0, 8], [0, 2], [0, 0]]); // X wins board 0 on O's turn
  assert.equal(s.activeBoard, null);
  assert.ok(getLegalMoves(s).every((m) => m.board !== 0));
  assert.equal(isLegalMove(s, 0, 1), false);
});

test('sent to a won board: free choice of any open board', () => {
  const s = play([[0, 4], [0, 1], [0, 8], [0, 2], [0, 0]]);
  assert.equal(s.currentPlayer, 'O');
  assert.equal(s.activeBoard, null);
  assert.deepEqual(getPlayableBoards(s), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test('a full board with no winner is a draw and gives free choice', () => {
  const s = createGame();
  s.cells[5] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', null];
  s.activeBoard = 5;
  const t = makeMove(s, 5, 8); // X fills the last cell: X O X / X O O / O X X, no line
  assert.equal(t.boardStatus[5], 'draw');
  assert.equal(t.activeBoard, null);
  assert.ok(!getPlayableBoards(t).includes(5));
  assert.equal(getPlayableBoards(t).length, 8);
});

test('three small boards in a row wins the game', () => {
  const s = createGame();
  s.boardStatus[0] = 'X';
  s.boardStatus[1] = 'X';
  // X needs to win board 2: X at 2:0 and 2:1, plays 2:2.
  s.cells[2][0] = 'X';
  s.cells[2][1] = 'X';
  s.activeBoard = 2;
  const t = makeMove(s, 2, 2);
  assert.equal(t.boardStatus[2], 'X');
  assert.equal(t.winner, 'X');
  assert.deepEqual(getLegalMoves(t), []);
  assert.throws(() => makeMove(t, 4, 4), /Illegal/);
});

test('drawn boards do not count toward a line', () => {
  assert.equal(lineWinner(['X', 'draw', 'X', null, null, null, null, null, null]), null);
  assert.equal(lineWinner(['draw', 'draw', 'draw', null, null, null, null, null, null]), null);
});

test('no legal moves and no winner is a draw', () => {
  const s = createGame();
  // Boards 0-7 closed with no 3-in-a-row of X/O at the big level.
  s.boardStatus = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', null];
  s.cells[8] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', null];
  s.activeBoard = 8;
  const t = makeMove(s, 8, 8);
  assert.equal(t.boardStatus[8], 'draw');
  assert.equal(t.winner, null);
  assert.equal(t.isDraw, true);
});

test('random full games always end in a win or draw with consistent state', () => {
  for (let g = 0; g < 500; g++) {
    let s = createGame();
    let moves = 0;
    while (!s.winner && !s.isDraw) {
      const legal = getLegalMoves(s);
      assert.ok(legal.length > 0);
      const { board, cell } = legal[Math.floor(Math.random() * legal.length)];
      s = makeMove(s, board, cell);
      moves++;
      assert.ok(moves <= 81);
    }
  }
});
