import { useState } from "react";
import "./App.css";

function Square({ value, onSquareClick, win = false }) {
  return (
    <button
      className="square"
      onClick={onSquareClick}
      style={{ backgroundColor: win ? "yellow" : "white" }}
    >
      {value ? value : "."}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, numrow = 3 }) {
  function handleClick(i) {
    let [winner, line] = calculateWinner(squares);
    if (winner || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares, i);
  }

  const [winner, line] = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else if (!squares.includes(null)) {
    //console.log(squares)
    status = "Draw, no one wins...";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="status">{status}</div>

      {[...Array(numrow)].map((_, i) => (
        <div key={i} className="board-row">
          {[...Array(numrow)].map((_, j) => {
            const index = i * numrow + j;
            return (
              <Square
                key={index}
                value={squares[index]}
                onSquareClick={() => handleClick(index)}
                win={line?.includes(index)}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

export default function Game() {
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const [movesHistory, setMovesHistory] = useState([null]);
  const [numrow, setNumrow] = useState(-1);
  const [inputRow, setInputRow] = useState(-1);
  const [history, setHistory] = useState([Array(9).fill(null)]);

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares, nextMove) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    const nextMoveHistory = [
      ...movesHistory.slice(0, currentMove + 1),
      nextMove,
    ];
    setMovesHistory(nextMoveHistory);
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move != currentMove) {
      if (move > 0) {
        description =
          "Go to move #" +
          move +
          "(" +
          Math.floor(movesHistory[move] / numrow) +
          ", " +
          (movesHistory[move] % numrow) +
          ")";
      } else {
        description = "Go to game start (null, null)";
      }
      return (
        <li key={move}>
          <button onClick={() => jumpTo(move)}>{description}</button>
        </li>
      );
    } else {
      if (move == 0) {
        description = "You're at the game start (null, null)";
      } else {
        description =
          "You're at move #" +
          move +
          "(" +
          Math.floor(movesHistory[move] / numrow) +
          ", " +
          (movesHistory[move] % numrow) +
          ")";
      }
      return <li key={move}>{description}</li>;
    }
  });

  return numrow <= 2 ? (
    <>
      <label>
        Enter n (nxn tic-tac-toe board, n is greater or equal to 3):{" "}
      </label>
      <input
        type="number"
        onChange={(e) => setInputRow(e.target.value)}
      ></input>
      <button
        onClick={() => {
          setNumrow(parseInt(inputRow));
          setHistory([Array(parseInt(inputRow) ** 2).fill(null)]);
        }}
      >
        OK
      </button>
    </>
  ) : (
    <div className="game" style={{ display: "flex" }}>
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          numrow={numrow}
        />
      </div>
      <div className="game-info" style={{ marginLeft: "4vw" }}>
        <div style={{ display: "flex" }}>
          <span>Display moves history in ascending order?</span>

          <label class="switch" style={{ marginLeft: "2vw" }}>
            <input
              type="checkbox"
              checked={isAscending}
              onClick={() => {
                setIsAscending(!isAscending);
              }}
            ></input>
            <span class="slider round"></span>
          </label>
        </div>

        <ol>{isAscending ? moves : moves.reverse()}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const size = Math.sqrt(squares.length);
  const lines = [];

  // Generate rows
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      row.push(i * size + j);
    }
    lines.push(row);
  }

  // Generate columns
  for (let i = 0; i < size; i++) {
    const col = [];
    for (let j = 0; j < size; j++) {
      col.push(i + j * size);
    }
    lines.push(col);
  }

  // Generate diagonals
  const diag1 = [];
  const diag2 = [];
  for (let i = 0; i < size; i++) {
    diag1.push(i * size + i);
    diag2.push(i * size + (size - 1 - i));
  }
  lines.push(diag1);
  lines.push(diag2);

  // Check for winner
  for (let i = 0; i < lines.length; i++) {
    const [a, ...rest] = lines[i];
    if (squares[a] && rest.every((index) => squares[index] === squares[a])) {
      return [squares[a], lines[i]];
    }
  }

  return [null, null];
}
