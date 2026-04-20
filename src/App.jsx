import React, { useState, useEffect } from "react";
import BoardList from "./BoardList";
import KanbanBoard from "./KanbanBoard";
import AdminPanel from "./AdminPanel";
import styles from "./App.module.css";
import Sidebar from "./SideBar";
import PomodoroTimer from "./PomodoroTimer";
import GamesPage from "./GamesPage";
import Minesweeper from "./Minesweeper";

const App = () => {
  const [user, setUser] = useState(null);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [boards, setBoards] = useState([]);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState(null);

  // Функции для бургер-меню (ВЫНЕСЕНЫ ИЗ useEffect)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Выбрать пункт меню
  const selectSidebarItem = (item) => {
    setActiveSidebarItem(item);
    setIsSidebarOpen(false); // Закрываем меню после выбора
  };

  // Проверка авторизации при загрузке
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      if (!userData.isAdmin) {
        loadUserBoards(userData.id);
      }
    }

    // Создаем админа если его нет
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const adminExists = users.find((u) => u.isAdmin);
    if (!adminExists) {
      const adminUser = {
        id: 999,
        email: "admin",
        name: "Администратор",
        password: "admin",
        isAdmin: true,
        avatar: null,
        createdAt: new Date().toISOString(),
      };
      users.push(adminUser);
      localStorage.setItem("users", JSON.stringify(users));
    }
  }, []);

  // Загрузка досок пользователя
  const loadUserBoards = (userId) => {
    const savedBoards = localStorage.getItem(`boards_${userId}`);
    if (savedBoards) {
      setBoards(JSON.parse(savedBoards));
    } else {
      const defaultBoards = [
        {
          id: Date.now(),
          name: "Моя первая доска",
          description: "Начните добавлять задачи",
          icon: "📋",
          color: "#667eea",
          createdAt: new Date().toISOString().split("T")[0],
          columns: [
            { id: Date.now() + 1, title: "To Do", tasks: [] },
            { id: Date.now() + 2, title: "In Progress", tasks: [] },
            { id: Date.now() + 3, title: "Done", tasks: [] },
          ],
        },
      ];
      setBoards(defaultBoards);
      localStorage.setItem(`boards_${userId}`, JSON.stringify(defaultBoards));
    }
  };

  // Регистрация
  const register = (email, password, name) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.find((u) => u.email === email)) {
      throw new Error("Пользователь с таким email уже существует");
    }

    const newUser = {
      id: Date.now(),
      email,
      name,
      password,
      isAdmin: false,
      avatar: null,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    const token = "token_" + Date.now();
    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: newUser.id,
        email,
        name,
        isAdmin: false,
        avatar: null,
      }),
    );

    setUser({ id: newUser.id, email, name, isAdmin: false, avatar: null });
    loadUserBoards(newUser.id);
    return true;
  };

  // Вход
  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );

    if (!user) {
      throw new Error("Неверный email или пароль");
    }

    if (user.isBlocked) {
      throw new Error("Ваш аккаунт заблокирован администратором");
    }

    const token = "token_" + Date.now();
    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin || false,
        avatar: user.avatar || null,
      }),
    );

    setUser({
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin || false,
      avatar: user.avatar || null,
    });

    if (!user.isAdmin) {
      loadUserBoards(user.id);
    }
    return true;
  };

  // Обновление аватара
  const updateAvatar = (avatarData) => {
    const updatedUser = { ...user, avatar: avatarData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, avatar: avatarData } : u,
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  // Выход
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setBoards([]);
    setCurrentBoard(null);
    setShowAdminPanel(false);
    setShowAvatarMenu(false);
  };

  // Создание новой доски
  const createBoard = (boardData) => {
    const newBoard = {
      id: Date.now(),
      name: boardData.name,
      description: boardData.description || "",
      icon: boardData.icon || "📋",
      color: boardData.color || "#667eea",
      createdAt: new Date().toISOString().split("T")[0],
      columns: [
        { id: Date.now() + 1, title: "To Do", tasks: [] },
        { id: Date.now() + 2, title: "In Progress", tasks: [] },
        { id: Date.now() + 3, title: "Done", tasks: [] },
      ],
    };
    const newBoards = [...boards, newBoard];
    setBoards(newBoards);
    localStorage.setItem(`boards_${user.id}`, JSON.stringify(newBoards));
  };

  // Удаление доски
  const deleteBoard = (boardId) => {
    if (window.confirm("Вы уверены, что хотите удалить эту доску?")) {
      const newBoards = boards.filter((board) => board.id !== boardId);
      setBoards(newBoards);
      localStorage.setItem(`boards_${user.id}`, JSON.stringify(newBoards));
      if (currentBoard?.id === boardId) {
        setCurrentBoard(null);
      }
    }
  };

  // Обновление доски
  const updateBoard = (updatedBoard) => {
    const newBoards = boards.map((board) =>
      board.id === updatedBoard.id ? updatedBoard : board,
    );
    setBoards(newBoards);
    localStorage.setItem(`boards_${user.id}`, JSON.stringify(newBoards));
    if (currentBoard?.id === updatedBoard.id) {
      setCurrentBoard(updatedBoard);
    }
  };

  // Форма авторизации
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        login(email, password);
      } else {
        if (!name.trim()) {
          setError("Введите имя");
          return;
        }
        register(email, password, name);
      }
      setEmail("");
      setPassword("");
      setName("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Если пользователь не авторизован, показываем форму входа/регистрации
  if (!user) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1>📋 Канбан Доска</h1>
            <p>{isLogin ? "Войдите в аккаунт" : "Создайте новый аккаунт"}</p>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {!isLogin && (
              <input
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <input
              type="text"
              placeholder={isLogin ? "Email или admin" : "Email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className={styles.submitBtn}>
              {isLogin ? "Войти" : "Зарегистрироваться"}
            </button>
          </form>

          <div className={styles.authFooter}>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className={styles.switchBtn}
            >
              {isLogin
                ? "Нет аккаунта? Зарегистрируйтесь"
                : "Уже есть аккаунт? Войдите"}
            </button>
          </div>

          {isLogin && (
            <div className={styles.demoHint}>
              <p>🔐 Демо доступ:</p>
              <p>Админ: admin / admin</p>
              <p>Пользователь: user@test.com / 123456 (зарегистрируйтесь)</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Если админ и открыта админ-панель
  if (user.isAdmin && showAdminPanel) {
    return (
      <AdminPanel
        onBack={() => setShowAdminPanel(false)}
        onLogout={logout}
        adminName={user.name}
      />
    );
  }

  // Если выбран таймер помодоро
  if (activeSidebarItem === "pomodoro") {
    return (
      <>
        <button
          onClick={() => setActiveSidebarItem(null)}
          className={styles.backToBoardBtn}
        >
          ← Вернуться к доскам
        </button>
        <PomodoroTimer />
      </>
    );
  }

  // Если выбраны игры
  if (activeSidebarItem === "games") {
    return (
      <GamesPage
        onBack={() => setActiveSidebarItem(null)}
        onSelectGame={(gameId) => setActiveSidebarItem(gameId)}
      />
    );
  }

  // Если выбран сапер
  if (activeSidebarItem === "minesweeper") {
    return (
      <>
        <button
          onClick={() => setActiveSidebarItem("games")}
          className={styles.backToBoardBtn}
        >
          ← Вернуться к играм
        </button>
        <Minesweeper onBack={() => setActiveSidebarItem("games")} />
      </>
    );
  }

  // Если пользователь авторизован, показываем доски
  return (
    <div className={styles.app}>
      <div className={styles.userBar}>
        <button onClick={toggleSidebar} className={styles.burgerBtn}>
          ☰
        </button>
        <div className={styles.userInfo}>
          <span>👋 Привет, {user.name}!</span>
          {user.isAdmin && (
            <button
              onClick={() => setShowAdminPanel(true)}
              className={styles.adminBtn}
            >
              👑 Админ-панель
            </button>
          )}
        </div>

        <div className={styles.userActions}>
          <div className={styles.avatarContainer}>
            <div
              className={styles.avatar}
              onClick={() => setShowAvatarMenu(!showAvatarMenu)}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {showAvatarMenu && (
              <div className={styles.avatarMenu}>
                <div className={styles.avatarMenuHeader}>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
                <div className={styles.avatarMenuDivider}></div>
                <button
                  onClick={() => {
                    setShowAvatarMenu(false);
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          updateAvatar(event.target.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  className={styles.avatarMenuItem}
                >
                  📸 Загрузить фото
                </button>
                <button
                  onClick={() => {
                    if (user.avatar) {
                      updateAvatar(null);
                      setShowAvatarMenu(false);
                    }
                  }}
                  className={styles.avatarMenuItem}
                  style={{ display: user.avatar ? "flex" : "none" }}
                >
                  🗑️ Удалить фото
                </button>
                <div className={styles.avatarMenuDivider}></div>
                <button
                  onClick={logout}
                  className={`${styles.avatarMenuItem} ${styles.logoutMenuItem}`}
                >
                  🚪 Выйти
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectItem={selectSidebarItem}
      />

      {!currentBoard ? (
        <BoardList
          boards={boards}
          onSelectBoard={setCurrentBoard}
          onCreateBoard={createBoard}
          onDeleteBoard={deleteBoard}
        />
      ) : (
        <KanbanBoard
          board={currentBoard}
          onBack={() => setCurrentBoard(null)}
          onUpdateBoard={updateBoard}
        />
      )}
    </div>
  );
};

export default App;
