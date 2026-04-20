import React, { useState, useEffect } from "react";
import styles from "./Minesweeper.module.css";

const Minesweeper = ({ onBack }) => {
  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [flags, setFlags] = useState(0);
  const [difficulty, setDifficulty] = useState("easy");
  const [firstMove, setFirstMove] = useState(true);

  // Настройки сложности
  const difficulties = {
    easy: { rows: 9, cols: 9, mines: 10, name: "Легкий" },
    medium: { rows: 16, cols: 16, mines: 40, name: "Средний" },
    hard: { rows: 16, cols: 30, mines: 99, name: "Сложный" },
  };

  // Инициализация доски
  const initBoard = (rows, cols, mines, firstRow, firstCol) => {
    // Создаем пустую доску
    let newBoard = Array(rows)
      .fill()
      .map(() =>
        Array(cols)
          .fill()
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborMines: 0,
          })),
      );

    // Размещаем мины (убеждаемся, что первая клетка не содержит мину)
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);

      if (
        !newBoard[row][col].isMine &&
        !(row === firstRow && col === firstCol)
      ) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Подсчитываем соседние мины
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!newBoard[i][j].isMine) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (
                ni >= 0 &&
                ni < rows &&
                nj >= 0 &&
                nj < cols &&
                newBoard[ni][nj].isMine
              ) {
                count++;
              }
            }
          }
          newBoard[i][j].neighborMines = count;
        }
      }
    }

    return newBoard;
  };

  // Открытие пустых клеток (рекурсивно)
  const revealEmptyCells = (board, row, col) => {
    const rows = board.length;
    const cols = board[0].length;

    if (row < 0 || row >= rows || col < 0 || col >= cols) return;
    if (board[row][col].isRevealed) return;
    if (board[row][col].isFlagged) return;

    board[row][col].isRevealed = true;

    if (board[row][col].neighborMines === 0 && !board[row][col].isMine) {
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          if (di === 0 && dj === 0) continue;
          revealEmptyCells(board, row + di, col + dj);
        }
      }
    }
  };

  // Обработка клика по клетке
  const handleCellClick = (row, col) => {
    if (gameOver || win) return;
    if (board[row][col].isRevealed) return;
    if (board[row][col].isFlagged) return;

    let newBoard = [...board];

    if (firstMove) {
      setFirstMove(false);
      const { rows, cols, mines } = difficulties[difficulty];
      newBoard = initBoard(rows, cols, mines, row, col);
      setBoard(newBoard);
    }

    if (newBoard[row][col].isMine) {
      // Проигрыш - показываем все мины
      for (let i = 0; i < newBoard.length; i++) {
        for (let j = 0; j < newBoard[0].length; j++) {
          if (newBoard[i][j].isMine) {
            newBoard[i][j].isRevealed = true;
          }
        }
      }
      setGameOver(true);
      setBoard(newBoard);
      return;
    }

    // Открываем клетку
    if (newBoard[row][col].neighborMines === 0) {
      revealEmptyCells(newBoard, row, col);
    } else {
      newBoard[row][col].isRevealed = true;
    }

    setBoard([...newBoard]);
    checkWin(newBoard);
  };

  // Обработка правого клика (флаг)
  const handleRightClick = (e, row, col) => {
    e.preventDefault();
    if (gameOver || win) return;
    if (board[row][col].isRevealed) return;

    let newBoard = [...board];
    if (
      !newBoard[row][col].isFlagged &&
      flags < difficulties[difficulty].mines
    ) {
      newBoard[row][col].isFlagged = true;
      setFlags(flags + 1);
    } else if (newBoard[row][col].isFlagged) {
      newBoard[row][col].isFlagged = false;
      setFlags(flags - 1);
    }
    setBoard(newBoard);
  };

  // Проверка победы
  const checkWin = (currentBoard) => {
    const { rows, cols, mines } = difficulties[difficulty];
    let revealedCount = 0;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (currentBoard[i][j].isRevealed && !currentBoard[i][j].isMine) {
          revealedCount++;
        }
      }
    }

    const totalSafe = rows * cols - mines;
    if (revealedCount === totalSafe) {
      setWin(true);
      setGameOver(true);
    }
  };

  // Новая игра
  const newGame = () => {
    const { rows, cols } = difficulties[difficulty];
    const emptyBoard = Array(rows)
      .fill()
      .map(() =>
        Array(cols)
          .fill()
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborMines: 0,
          })),
      );
    setBoard(emptyBoard);
    setGameOver(false);
    setWin(false);
    setFlags(0);
    setFirstMove(true);
  };

  // Смена сложности
  const changeDifficulty = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setTimeout(() => newGame(), 0);
  };

  // Получение цвета цифры
  const getNumberColor = (num) => {
    const colors = {
      1: "#1976d2",
      2: "#388e3c",
      3: "#d32f2f",
      4: "#7b1fa2",
      5: "#ff9800",
      6: "#009688",
      7: "#000000",
      8: "#795548",
    };
    return colors[num] || "#000000";
  };

  // Инициализация при загрузке
  useEffect(() => {
    newGame();
  }, [difficulty]);

  const currentDiff = difficulties[difficulty];
  const remainingMines = currentDiff.mines - flags;

  return (
    <div className={styles.minesweeperContainer}>
      <div className={styles.gameWrapper}>
        <div className={styles.gameHeader}>
          <button onClick={onBack} className={styles.backBtn}>
            ← Вернуться к играм
          </button>
          <h1>💣 Сапер</h1>
        </div>

        <div className={styles.gamePanel}>
          <div className={styles.difficultySelector}>
            <button
              className={`${styles.diffBtn} ${difficulty === "easy" ? styles.active : ""}`}
              onClick={() => changeDifficulty("easy")}
            >
              🟢 Легкий
            </button>
            <button
              className={`${styles.diffBtn} ${difficulty === "medium" ? styles.active : ""}`}
              onClick={() => changeDifficulty("medium")}
            >
              🟡 Средний
            </button>
            <button
              className={`${styles.diffBtn} ${difficulty === "hard" ? styles.active : ""}`}
              onClick={() => changeDifficulty("hard")}
            >
              🔴 Сложный
            </button>
          </div>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>💣</span>
              <span className={styles.statValue}>{remainingMines}</span>
            </div>
            <button onClick={newGame} className={styles.newGameBtn}>
              {gameOver && !win ? "😵" : win ? "🏆" : "😊"}
            </button>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>🚩</span>
              <span className={styles.statValue}>{flags}</span>
            </div>
          </div>

          <div
            className={styles.board}
            style={{
              gridTemplateColumns: `repeat(${currentDiff.cols}, 35px)`,
            }}
          >
            {board.map((row, i) =>
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`
                    ${styles.cell} 
                    ${cell.isRevealed ? styles.revealed : ""}
                    ${cell.isFlagged ? styles.flagged : ""}
                    ${cell.isMine && cell.isRevealed ? styles.mine : ""}
                  `}
                  onClick={() => handleCellClick(i, j)}
                  onContextMenu={(e) => handleRightClick(e, i, j)}
                >
                  {cell.isRevealed &&
                    !cell.isMine &&
                    cell.neighborMines > 0 && (
                      <span
                        style={{ color: getNumberColor(cell.neighborMines) }}
                      >
                        {cell.neighborMines}
                      </span>
                    )}
                  {cell.isRevealed && cell.isMine && "💣"}
                  {cell.isFlagged && !cell.isRevealed && "🚩"}
                </div>
              )),
            )}
          </div>

          {gameOver && (
            <div className={styles.gameOverlay}>
              <div className={styles.gameMessage}>
                {win ? (
                  <>
                    <h2>🎉 Победа! 🎉</h2>
                    <p>Вы нашли все мины!</p>
                  </>
                ) : (
                  <>
                    <h2>💥 Игра окончена 💥</h2>
                    <p>Вы подорвались на мине...</p>
                  </>
                )}
                <button onClick={newGame} className={styles.playAgainBtn}>
                  Играть снова
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.instructions}>
          <p>
            💡 <strong>Как играть:</strong>
          </p>
          <p>• Левый клик - открыть клетку</p>
          <p>• Правый клик - поставить/убрать флаг</p>
          <p>• Числа показывают сколько мин рядом</p>
        </div>
      </div>
    </div>
  );
};

export default Minesweeper;
