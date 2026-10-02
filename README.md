# Ultimate Tic-Tac-Toe

A two-player, same-computer web version of Ultimate Tic-Tac-Toe. Plain HTML, CSS and JavaScript with no build step.

## Rules

1. The board is a 3x3 grid of small tic-tac-toe boards.
2. X goes first and can play in any cell of any board.
3. After a move, the next player must play on the same small board. Play anywhere on the top-right board, and your opponent must also play on the top-right board.
4. Three in a row on a small board wins that board. A full board with no winner is a draw and belongs to nobody.
5. If that board is now won or full, the next player can play in any open board.
6. Win three small boards in a row to win the game. If no moves are left and nobody has won, the game is a draw.

The boards you are allowed to play in are highlighted in yellow.

## Run it

ES modules do not load from `file://`, so serve the folder:

```
npx serve .
```

or `python3 -m http.server`, then open the printed URL. It also works as-is on GitHub Pages.

### With Docker

```
docker build -t ultimate-tic-tac-toe .
docker run --rm -p 8080:80 ultimate-tic-tac-toe
```

Then open http://localhost:8080. The image is nginx serving the four app files, so it runs the same anywhere Docker does.

## Tests

Requires Node 18+. No dependencies.

```
npm test
```

## Structure

| File | Role |
|---|---|
| `game.js` | All game rules. Pure functions, no DOM, so it is fully testable in Node. `makeMove` returns a new state and never mutates the old one. |
| `ui.js` | Draws the board from the state and turns clicks into `makeMove` calls. Contains no rules. |
| `index.html`, `style.css` | Page and layout. |
| `Dockerfile` | Packages the app into an nginx image. |
| `tests/game.test.js` | Unit tests for every rule, plus 500 random full games as a consistency check. |
