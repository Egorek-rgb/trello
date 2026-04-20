import React from "react";
import styles from "./GamesPage.module.css";

const GamesPage = ({ onBack, onSelectGame }) => {
  const games = [
    {
      id: "minesweeper",
      title: "Сапер",
      description:
        "Классическая игра на логику. Найди все мины, не подорвавшись!",
      icon: "💣",
      color: "#ff6b6b",
      bgColor: "#ffe0e0",
      difficulty: "Средняя",
      timeToPlay: "5-15 мин",
    },
    {
      id: "snake",
      title: "Змейка",
      description:
        "Управляй змейкой, собирай еду и не врезайся в стены или себя!",
      icon: "🐍",
      color: "#4ecdc4",
      bgColor: "#e0f7f5",
      difficulty: "Легкая",
      timeToPlay: "3-10 мин",
    },
    {
      id: "racing",
      title: "Гонки",
      description: "Гоночная аркада. Обгоняй соперников и приходи первым!",
      icon: "🏎️",
      color: "#ffe66d",
      bgColor: "#fff5e0",
      difficulty: "Сложная",
      timeToPlay: "10-20 мин",
    },
  ];

  const handleGameClick = (gameId) => {
    if (gameId === "minesweeper") {
      // Передаем в App, что выбрана игра Сапер
      onSelectGame(gameId);
    } else {
      alert(`Игра "${gameId}" будет доступна в следующем обновлении! 🎮`);
    }
  };

  return (
    <div className={styles.gamesContainer}>
      <div className={styles.gamesHeader}>
        <button onClick={onBack} className={styles.backBtn}>
          ← Вернуться к доскам
        </button>
        <h1>🎮 Игровая зона</h1>
        <p>Выбери игру и отдохни от работы!</p>
      </div>

      <div className={styles.gamesGrid}>
        {games.map((game) => (
          <div
            key={game.id}
            className={styles.gameCard}
            onClick={() => handleGameClick(game.id)}
            style={{ background: game.bgColor }}
          >
            <div className={styles.gameIcon} style={{ background: game.color }}>
              {game.icon}
            </div>

            <div className={styles.gameInfo}>
              <h2 className={styles.gameTitle}>{game.title}</h2>
              <p className={styles.gameDescription}>{game.description}</p>

              <div className={styles.gameTags}>
                <span className={styles.tag}>📊 {game.difficulty}</span>
                <span className={styles.tag}>⏱️ {game.timeToPlay}</span>
              </div>
            </div>

            <div className={styles.playButton}>
              <span>Играть →</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.infoSection}>
        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>🎯</div>
          <h3>Скоро будут добавлены</h3>
          <p>Тетрис, Пакман, 2048 и другие классические игры</p>
        </div>
      </div>
    </div>
  );
};

export default GamesPage;
