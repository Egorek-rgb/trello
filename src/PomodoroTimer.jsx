import React, { useState, useEffect, useRef } from "react";
import styles from "./PomodoroTimer.module.css";

const PomodoroTimer = () => {
  // Режимы таймера
  const [mode, setMode] = useState("pomodoro"); // 'pomodoro', 'shortBreak', 'longBreak'
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 минут в секундах
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Настройки времени (в минутах)
  const [settings, setSettings] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
  });

  const [tempSettings, setTempSettings] = useState(settings);
  const audioRef = useRef(null);

  // Создаем звук при завершении
  useEffect(() => {
    audioRef.current = new Audio(
      "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3",
    );
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Обновление времени при смене режима
  useEffect(() => {
    if (mode === "pomodoro") {
      setTimeLeft(settings.pomodoro * 60);
    } else if (mode === "shortBreak") {
      setTimeLeft(settings.shortBreak * 60);
    } else if (mode === "longBreak") {
      setTimeLeft(settings.longBreak * 60);
    }
    setIsActive(false);
  }, [mode, settings]);

  // Основной таймер
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Таймер закончился
      setIsActive(false);
      if (audioRef.current) {
        audioRef.current.play();
      }

      // Если закончился помодоро, увеличиваем счетчик сессий
      if (mode === "pomodoro") {
        const newSessions = sessions + 1;
        setSessions(newSessions);

        // Каждые 4 помодоро - длинный перерыв
        if (newSessions % 4 === 0) {
          setMode("longBreak");
        } else {
          setMode("shortBreak");
        }
      } else {
        // Если закончился перерыв, переключаем на помодоро
        setMode("pomodoro");
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, sessions]);

  // Форматирование времени (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Вычисление процента для кругового прогресса
  const getProgress = () => {
    let total;
    if (mode === "pomodoro") {
      total = settings.pomodoro * 60;
    } else if (mode === "shortBreak") {
      total = settings.shortBreak * 60;
    } else {
      total = settings.longBreak * 60;
    }
    return ((total - timeLeft) / total) * 100;
  };

  // Получение цвета в зависимости от режима
  const getColor = () => {
    switch (mode) {
      case "pomodoro":
        return "#ff4757";
      case "shortBreak":
        return "#28a745";
      case "longBreak":
        return "#17a2b8";
      default:
        return "#ff4757";
    }
  };

  // Получение названия режима
  const getModeName = () => {
    switch (mode) {
      case "pomodoro":
        return "Время работы";
      case "shortBreak":
        return "Короткий перерыв";
      case "longBreak":
        return "Длинный перерыв";
      default:
        return "Помодоро";
    }
  };

  // Управление таймером
  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    if (mode === "pomodoro") {
      setTimeLeft(settings.pomodoro * 60);
    } else if (mode === "shortBreak") {
      setTimeLeft(settings.shortBreak * 60);
    } else {
      setTimeLeft(settings.longBreak * 60);
    }
  };
  const skipTimer = () => {
    setIsActive(false);
    if (mode === "pomodoro") {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      if (newSessions % 4 === 0) {
        setMode("longBreak");
      } else {
        setMode("shortBreak");
      }
    } else {
      setMode("pomodoro");
    }
  };

  // Сохранение настроек
  const saveSettings = () => {
    setSettings(tempSettings);
    setShowSettings(false);
  };

  // Цвет для кругового прогресса
  const progress = getProgress();
  const radius = 180;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={styles.pomodoroContainer}>
      <div className={styles.pomodoroCard}>
        <div className={styles.header}>
          <h1>🍅 Таймер Помодоро</h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={styles.settingsBtn}
          >
            ⚙️
          </button>
        </div>

        {/* Настройки */}
        {showSettings && (
          <div className={styles.settingsModal}>
            <div className={styles.settingsContent}>
              <h3>Настройки времени</h3>
              <div className={styles.settingItem}>
                <label>🍅 Помодоро (мин)</label>
                <input
                  type="number"
                  value={tempSettings.pomodoro}
                  onChange={(e) =>
                    setTempSettings({
                      ...tempSettings,
                      pomodoro: parseInt(e.target.value) || 0,
                    })
                  }
                  min="1"
                  max="60"
                />
              </div>
              <div className={styles.settingItem}>
                <label>☕ Короткий перерыв (мин)</label>
                <input
                  type="number"
                  value={tempSettings.shortBreak}
                  onChange={(e) =>
                    setTempSettings({
                      ...tempSettings,
                      shortBreak: parseInt(e.target.value) || 0,
                    })
                  }
                  min="1"
                  max="30"
                />
              </div>
              <div className={styles.settingItem}>
                <label>🎉 Длинный перерыв (мин)</label>
                <input
                  type="number"
                  value={tempSettings.longBreak}
                  onChange={(e) =>
                    setTempSettings({
                      ...tempSettings,
                      longBreak: parseInt(e.target.value) || 0,
                    })
                  }
                  min="1"
                  max="45"
                />
              </div>
              <div className={styles.settingsButtons}>
                <button onClick={saveSettings}>Сохранить</button>
                <button onClick={() => setShowSettings(false)}>Отмена</button>
              </div>
            </div>
          </div>
        )}

        {/* Круглый таймер */}
        <div className={styles.timerContainer}>
          <svg className={styles.progressRing} width="400" height="400">
            {/* Фоновый круг */}
            <circle
              className={styles.progressRingCircle}
              stroke="#e0e0e0"
              strokeWidth="8"
              fill="transparent"
              r={radius}
              cx="200"
              cy="200"
            />
            {/* Прогресс круг */}
            <circle
              className={styles.progressRingCircle}
              stroke={getColor()}
              strokeWidth="8"
              fill="transparent"
              r={radius}
              cx="200"
              cy="200"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          <div className={styles.timerContent}>
            <div className={styles.modeName}>{getModeName()}</div>
            <div className={styles.timeDisplay}>{formatTime(timeLeft)}</div>
            <div className={styles.controls}>
              <button onClick={toggleTimer} className={styles.controlBtn}>
                {isActive ? "⏸️ Пауза" : "▶️ Старт"}
              </button>
              <button onClick={resetTimer} className={styles.controlBtn}>
                🔄 Сброс
              </button>
              <button onClick={skipTimer} className={styles.controlBtn}>
                ⏭️ Пропустить
              </button>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{sessions}</div>
            <div className={styles.statLabel}>Помодоро завершено</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>
              {Math.floor((sessions * settings.pomodoro) / 60)}ч{" "}
              {(sessions * settings.pomodoro) % 60}м
            </div>
            <div className={styles.statLabel}>Всего времени</div>
          </div>
        </div>

        {/* Кнопки режимов */}
        <div className={styles.modeButtons}>
          <button
            className={`${styles.modeBtn} ${mode === "pomodoro" ? styles.activeMode : ""}`}
            onClick={() => setMode("pomodoro")}
            style={{ borderColor: mode === "pomodoro" ? "#ff4757" : "#ddd" }}
          >
            🍅 Помодоро
          </button>
          <button
            className={`${styles.modeBtn} ${mode === "shortBreak" ? styles.activeMode : ""}`}
            onClick={() => setMode("shortBreak")}
            style={{ borderColor: mode === "shortBreak" ? "#28a745" : "#ddd" }}
          >
            ☕ Короткий
          </button>
          <button
            className={`${styles.modeBtn} ${mode === "longBreak" ? styles.activeMode : ""}`}
            onClick={() => setMode("longBreak")}
            style={{ borderColor: mode === "longBreak" ? "#17a2b8" : "#ddd" }}
          >
            🎉 Длинный
          </button>
        </div>

        {/* Советы */}
        <div className={styles.tips}>
          <p>
            💡 Совет: Используйте технику Pomodoro для повышения продуктивности!
          </p>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
