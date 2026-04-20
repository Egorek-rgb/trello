import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Проверяем сохраненного пользователя при загрузке
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Регистрация
  const register = (email, password, name) => {
    // Получаем существующих пользователей
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Проверяем, не занят ли email
    if (users.find((u) => u.email === email)) {
      throw new Error("Пользователь с таким email уже существует");
    }

    // Создаем нового пользователя
    const newUser = {
      id: Date.now(),
      email,
      name,
      password, // В реальном проекте нужно хэшировать!
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Создаем токен и сохраняем пользователя
    const token = "token_" + Date.now();
    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify({ id: newUser.id, email, name }),
    );

    setUser({ id: newUser.id, email, name });
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

    const token = "token_" + Date.now();
    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify({ id: user.id, email: user.email, name: user.name }),
    );

    setUser({ id: user.id, email: user.email, name: user.name });
    return true;
  };

  // Выход
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
