import React from "react";
import styles from "./Sidebar.module.css";

const Sidebar = ({ isOpen, onClose, onSelectItem }) => {
  const menuItems = [
    {
      id: "pomodoro",
      title: "🍅 Таймер помодоро",
      icon: "⏱️",
      description: "Управляй временем",
    },
    {
      id: "games",
      title: "🎮 Игры",
      icon: "🕹️",
      description: "Отдохни немного",
    },
    {
      id: "notes",
      title: "📝 Быстрые заметки",
      icon: "✏️",
      description: "Запиши идеи",
    },
  ];

  return (
    <>
      {/* Оверлей (темный фон) */}
      {isOpen && <div className={styles.overlay} onClick={onClose}></div>}

      {/* Боковое меню */}
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.sidebarHeader}>
          <h2>📋 Меню</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        </div>

        <div className={styles.sidebarContent}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={styles.menuItem}
              onClick={() => onSelectItem(item.id)}
            >
              <div className={styles.menuIcon}>{item.icon}</div>
              <div className={styles.menuInfo}>
                <div className={styles.menuTitle}>{item.title}</div>
                <div className={styles.menuDescription}>{item.description}</div>
              </div>
              <div className={styles.menuArrow}>→</div>
            </button>
          ))}
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.version}>Версия 1.0.0</div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
