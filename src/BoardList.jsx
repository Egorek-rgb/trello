import React, { useState } from "react";
import styles from "./BoardList.module.css";

const BoardList = ({ boards, onSelectBoard, onCreateBoard, onDeleteBoard }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBoard, setNewBoard] = useState({
    name: "",
    description: "",
    icon: "📋",
    color: "#667eea",
  });

  const colors = [
    "#667eea",
    "#f093fb",
    "#4facfe",
    "#43e97b",
    "#fa709a",
    "#fee140",
    "#30cfd0",
    "#a8edea",
    "#ff9a9e",
    "#a18cd1",
  ];

  const icons = ["📋", "💼", "🏠", "📚", "🎯", "💡", "🎨", "🚀", "⭐", "❤️"];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newBoard.name.trim()) {
      onCreateBoard(newBoard);
      setNewBoard({ name: "", description: "", icon: "📋", color: "#667eea" });
      setShowCreateForm(false);
    }
  };

  return (
    <div className={styles.boardList}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>🎯</span>
          Мои доски
        </h1>
        <button
          className={styles.createBoardBtn}
          onClick={() => setShowCreateForm(true)}
        >
          + Создать доску
        </button>
      </div>

      {showCreateForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Создать новую доску</h2>
              <button onClick={() => setShowCreateForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Название доски *</label>
                <input
                  type="text"
                  placeholder="Например: Рабочие задачи"
                  value={newBoard.name}
                  onChange={(e) =>
                    setNewBoard({ ...newBoard, name: e.target.value })
                  }
                  autoFocus
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Описание</label>
                <textarea
                  placeholder="Краткое описание доски..."
                  value={newBoard.description}
                  onChange={(e) =>
                    setNewBoard({ ...newBoard, description: e.target.value })
                  }
                  rows="3"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Иконка</label>
                <div className={styles.iconPicker}>
                  {icons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`${styles.iconOption} ${newBoard.icon === icon ? styles.selected : ""}`}
                      onClick={() => setNewBoard({ ...newBoard, icon })}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Цвет</label>
                <div className={styles.colorPicker}>
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`${styles.colorOption} ${newBoard.color === color ? styles.selected : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewBoard({ ...newBoard, color })}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.formButtons}>
                <button type="submit" className={styles.submitBtn}>
                  Создать
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className={styles.cancelBtn}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.boardsGrid}>
        {boards.map((board) => (
          <div
            key={board.id}
            className={styles.boardCard}
            style={{ borderTopColor: board.color }}
            onClick={() => onSelectBoard(board)}
          >
            <div className={styles.boardHeader}>
              <div
                className={styles.boardIcon}
                style={{ backgroundColor: board.color + "20" }}
              >
                {board.icon}
              </div>
              <button
                className={styles.deleteBoardBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBoard(board.id);
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.boardContent}>
              <h3 className={styles.boardName}>{board.name}</h3>
              <p className={styles.boardDescription}>
                {board.description || "Нет описания"}
              </p>

              <div className={styles.boardStats}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>
                    {board.columns.reduce(
                      (sum, col) => sum + col.tasks.length,
                      0,
                    )}
                  </span>
                  <span className={styles.statLabel}>задач</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>
                    {board.columns.length}
                  </span>
                  <span className={styles.statLabel}>колонок</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{board.createdAt}</span>
                  <span className={styles.statLabel}>создана</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {boards.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <h3>Нет досок</h3>
            <p>Создайте свою первую доску, чтобы начать работу</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardList;
