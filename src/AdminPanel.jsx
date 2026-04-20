import React, { useState, useEffect } from "react";
import styles from "./AdminPanel.module.css";

const AdminPanel = ({ onBack, onLogout, adminName }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBoards: 0,
    totalTasks: 0,
    admins: 0,
    regularUsers: 0,
  });
  const [systemLogs, setSystemLogs] = useState([]);
  const [announcement, setAnnouncement] = useState("");
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  // Загрузка пользователей
  useEffect(() => {
    loadUsers();
    loadStats();
    loadSystemLogs();
  }, []);

  const loadUsers = () => {
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    setUsers(allUsers);
  };

  const loadStats = () => {
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    let totalBoards = 0;
    let totalTasks = 0;

    allUsers.forEach((user) => {
      if (!user.isAdmin) {
        const userBoards = JSON.parse(
          localStorage.getItem(`boards_${user.id}`) || "[]",
        );
        totalBoards += userBoards.length;
        userBoards.forEach((board) => {
          board.columns.forEach((column) => {
            totalTasks += column.tasks.length;
          });
        });
      }
    });

    setStats({
      totalUsers: allUsers.length,
      totalBoards,
      totalTasks,
      admins: allUsers.filter((u) => u.isAdmin).length,
      regularUsers: allUsers.filter((u) => !u.isAdmin).length,
    });
  };

  const loadSystemLogs = () => {
    const logs = JSON.parse(localStorage.getItem("systemLogs") || "[]");
    setSystemLogs(logs.slice(-20)); // Показываем последние 20 логов
  };

  const addSystemLog = (action, details) => {
    const logs = JSON.parse(localStorage.getItem("systemLogs") || "[]");
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      admin: adminName,
      action,
      details,
    };
    logs.push(newLog);
    localStorage.setItem("systemLogs", JSON.stringify(logs));
    setSystemLogs(logs.slice(-20));
  };

  // Удаление пользователя
  const deleteUser = (userId) => {
    const userToDelete = users.find((u) => u.id === userId);
    if (userToDelete.isAdmin) {
      alert("Нельзя удалить администратора!");
      return;
    }

    if (
      window.confirm(
        `Удалить пользователя "${userToDelete.name}"? Все его доски будут удалены!`,
      )
    ) {
      // Удаляем доски пользователя
      localStorage.removeItem(`boards_${userId}`);

      // Удаляем пользователя
      const newUsers = users.filter((u) => u.id !== userId);
      setUsers(newUsers);
      localStorage.setItem("users", JSON.stringify(newUsers));

      // Добавляем лог
      addSystemLog(
        "Удаление пользователя",
        `Удален пользователь: ${userToDelete.name} (${userToDelete.email})`,
      );

      // Обновляем статистику
      loadStats();
      alert("Пользователь удален");
    }
  };

  // Просмотр досок пользователя
  const viewUserBoards = (user) => {
    const userBoards = JSON.parse(
      localStorage.getItem(`boards_${user.id}`) || "[]",
    );
    setSelectedUser({ ...user, boards: userBoards });
    setShowUserModal(true);
  };

  // Удаление доски пользователя
  const deleteUserBoard = (userId, boardId) => {
    if (window.confirm("Удалить эту доску?")) {
      const userBoards = JSON.parse(
        localStorage.getItem(`boards_${userId}`) || "[]",
      );
      const newBoards = userBoards.filter((b) => b.id !== boardId);
      localStorage.setItem(`boards_${userId}`, JSON.stringify(newBoards));
      viewUserBoards(users.find((u) => u.id === userId));
      loadStats();
      addSystemLog(
        "Удаление доски",
        `Удалена доска пользователя ID: ${userId}`,
      );
    }
  };

  // Блокировка/разблокировка пользователя
  const toggleUserBlock = (userId) => {
    const newUsers = users.map((u) => {
      if (u.id === userId && !u.isAdmin) {
        const newBlocked = !u.isBlocked;
        addSystemLog(
          newBlocked ? "Блокировка пользователя" : "Разблокировка пользователя",
          `${newBlocked ? "Заблокирован" : "Разблокирован"} пользователь: ${u.name}`,
        );
        return { ...u, isBlocked: newBlocked };
      }
      return u;
    });
    setUsers(newUsers);
    localStorage.setItem("users", JSON.stringify(newUsers));
  };

  // Отправка уведомления всем пользователям
  const sendAnnouncement = () => {
    if (announcement.trim()) {
      const announcements = JSON.parse(
        localStorage.getItem("announcements") || "[]",
      );
      const newAnnouncement = {
        id: Date.now(),
        text: announcement,
        date: new Date().toLocaleString(),
        admin: adminName,
      };
      announcements.push(newAnnouncement);
      localStorage.setItem("announcements", JSON.stringify(announcements));
      addSystemLog("Отправка объявления", `Объявление: ${announcement}`);
      setAnnouncement("");
      setShowAnnouncement(false);
      alert("Объявление отправлено всем пользователям!");
    }
  };

  // Очистка логов
  const clearLogs = () => {
    if (window.confirm("Очистить все логи?")) {
      localStorage.setItem("systemLogs", JSON.stringify([]));
      setSystemLogs([]);
      addSystemLog("Очистка логов", "Логи были очищены");
    }
  };

  // Создание тестового пользователя
  const createTestUser = () => {
    const testUser = {
      id: Date.now(),
      email: `test${Date.now()}@test.com`,
      name: `Тестовый пользователь ${Math.floor(Math.random() * 1000)}`,
      password: "123456",
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };

    const newUsers = [...users, testUser];
    setUsers(newUsers);
    localStorage.setItem("users", JSON.stringify(newUsers));

    // Создаем тестовые доски
    const testBoards = [
      {
        id: Date.now(),
        name: "Тестовая доска",
        description: "Доска для тестирования",
        icon: "🧪",
        color: "#ff6b6b",
        createdAt: new Date().toISOString().split("T")[0],
        columns: [
          { id: Date.now() + 1, title: "To Do", tasks: [] },
          { id: Date.now() + 2, title: "In Progress", tasks: [] },
          { id: Date.now() + 3, title: "Done", tasks: [] },
        ],
      },
    ];
    localStorage.setItem(`boards_${testUser.id}`, JSON.stringify(testBoards));

    addSystemLog(
      "Создание тестового пользователя",
      `Создан тестовый пользователь: ${testUser.name}`,
    );
    loadStats();
    alert(
      `Тестовый пользователь создан!\nEmail: ${testUser.email}\nПароль: 123456`,
    );
  };

  return (
    <div className={styles.adminPanel}>
      <div className={styles.adminHeader}>
        <div className={styles.headerLeft}>
          <button onClick={onBack} className={styles.backBtn}>
            ← На главную
          </button>
          <h1>👑 Админ-панель</h1>
        </div>
        <div className={styles.headerRight}>
          <span>Администратор: {adminName}</span>
          <button onClick={onLogout} className={styles.logoutBtn}>
            Выйти
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statInfo}>
            <h3>{stats.totalUsers}</h3>
            <p>Всего пользователей</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📋</div>
          <div className={styles.statInfo}>
            <h3>{stats.totalBoards}</h3>
            <p>Всего досок</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statInfo}>
            <h3>{stats.totalTasks}</h3>
            <p>Всего задач</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👑</div>
          <div className={styles.statInfo}>
            <h3>{stats.admins}</h3>
            <p>Администраторов</p>
          </div>
        </div>
      </div>

      {/* Действия админа */}
      <div className={styles.adminActions}>
        <h2>⚡ Быстрые действия</h2>
        <div className={styles.actionsGrid}>
          <button onClick={createTestUser} className={styles.actionBtn}>
            🧪 Создать тестового пользователя
          </button>
          <button
            onClick={() => setShowAnnouncement(true)}
            className={styles.actionBtn}
          >
            📢 Сделать объявление
          </button>
          <button onClick={clearLogs} className={styles.actionBtn}>
            🗑️ Очистить логи
          </button>
          <button onClick={loadStats} className={styles.actionBtn}>
            🔄 Обновить статистику
          </button>
        </div>
      </div>

      {/* Объявление */}
      {showAnnouncement && (
        <div className={styles.announcementModal}>
          <div className={styles.modalContent}>
            <h3>📢 Создать объявление</h3>
            <textarea
              placeholder="Введите текст объявления..."
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              rows="4"
            />
            <div className={styles.modalButtons}>
              <button onClick={sendAnnouncement}>Отправить</button>
              <button onClick={() => setShowAnnouncement(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Список пользователей */}
      <div className={styles.usersSection}>
        <h2>👥 Управление пользователями</h2>
        <div className={styles.usersTable}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Статус</th>
                <th>Дата регистрации</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={user.isBlocked ? styles.blockedUser : ""}
                >
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.isAdmin ? (
                      <span className={styles.adminBadge}>Админ</span>
                    ) : (
                      <span className={styles.userBadge}>Пользователь</span>
                    )}
                  </td>
                  <td>
                    {user.isBlocked ? (
                      <span className={styles.blockedBadge}>Заблокирован</span>
                    ) : (
                      <span className={styles.activeBadge}>Активен</span>
                    )}
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className={styles.userActions}>
                    {!user.isAdmin && (
                      <>
                        <button
                          onClick={() => viewUserBoards(user)}
                          className={styles.viewBtn}
                          title="Просмотреть доски"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => toggleUserBlock(user.id)}
                          className={
                            user.isBlocked ? styles.unblockBtn : styles.blockBtn
                          }
                          title={
                            user.isBlocked ? "Разблокировать" : "Заблокировать"
                          }
                        >
                          {user.isBlocked ? "🔓" : "🔒"}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className={styles.deleteBtn}
                          title="Удалить"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Системные логи */}
      <div className={styles.logsSection}>
        <h2>📜 Системные логи</h2>
        <div className={styles.logsList}>
          {systemLogs.map((log) => (
            <div key={log.id} className={styles.logItem}>
              <span className={styles.logTime}>[{log.timestamp}]</span>
              <span className={styles.logAdmin}>{log.admin}:</span>
              <span className={styles.logAction}>{log.action}</span>
              <span className={styles.logDetails}>- {log.details}</span>
            </div>
          ))}
          {systemLogs.length === 0 && (
            <div className={styles.noLogs}>Логи отсутствуют</div>
          )}
        </div>
      </div>

      {/* Модальное окно с досками пользователя */}
      {showUserModal && selectedUser && (
        <div className={styles.modal} onClick={() => setShowUserModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Доски пользователя: {selectedUser.name}</h3>
              <button onClick={() => setShowUserModal(false)}>✕</button>
            </div>
            <div className={styles.userBoardsList}>
              {selectedUser.boards.length === 0 ? (
                <p>Нет досок</p>
              ) : (
                selectedUser.boards.map((board) => (
                  <div key={board.id} className={styles.userBoardItem}>
                    <div className={styles.boardInfo}>
                      <span className={styles.boardIcon}>{board.icon}</span>
                      <div>
                        <h4>{board.name}</h4>
                        <p>{board.description || "Нет описания"}</p>
                        <small>Создана: {board.createdAt}</small>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteUserBoard(selectedUser.id, board.id)}
                      className={styles.deleteBoardBtn}
                    >
                      Удалить
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
