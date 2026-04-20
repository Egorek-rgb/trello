import React, { useState, useEffect, useRef } from "react";
import styles from "./ChatWidget.module.css";

const ChatWidget = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isAdmin = user?.isAdmin || false;

  // Загрузка сообщений
  useEffect(() => {
    loadMessages();
    const interval = setInterval(() => {
      if (!isOpen) checkNewMessages();
      loadMessages();
    }, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = () => {
    const savedMessages = JSON.parse(
      localStorage.getItem("chatMessages") || "[]",
    );
    setMessages(savedMessages);

    if (!isAdmin && !isOpen) {
      const unread = savedMessages.filter(
        (m) => !m.isRead && !m.isFromUser && m.userId === user?.id,
      ).length;
      setUnreadCount(unread);
    }
    if (isAdmin && !isOpen) {
      const unread = savedMessages.filter(
        (m) => !m.isRead && m.isFromUser,
      ).length;
      setUnreadCount(unread);
    }
  };

  const checkNewMessages = () => {
    const savedMessages = JSON.parse(
      localStorage.getItem("chatMessages") || "[]",
    );
    const lastMessage = savedMessages[savedMessages.length - 1];
    if (
      lastMessage &&
      messages.length > 0 &&
      lastMessage.id !== messages[messages.length - 1]?.id
    ) {
      if (!isAdmin && !lastMessage.isFromUser)
        setUnreadCount((prev) => prev + 1);
      if (isAdmin && lastMessage.isFromUser) setUnreadCount((prev) => prev + 1);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: new Date().toLocaleDateString(),
      isFromUser: !isAdmin,
      userId: user?.id,
      userName: user?.name,
      userAvatar: user?.avatar || user?.name?.charAt(0).toUpperCase(),
      isRead: false,
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
    setNewMessage("");
  };

  const markAsRead = () => {
    const updatedMessages = messages.map((m) => ({ ...m, isRead: true }));
    setMessages(updatedMessages);
    localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
    setUnreadCount(0);
  };

  const openChat = () => {
    setIsOpen(true);
    markAsRead();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Группировка сообщений по датам
  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach((msg) => {
      if (!groups[msg.date]) groups[msg.date] = [];
      groups[msg.date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <>
      {!isOpen && (
        <button className={styles.chatButton} onClick={openChat}>
          <div className={styles.chatIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
                fill="white"
              />
            </svg>
          </div>
          {unreadCount > 0 && (
            <div className={styles.unreadBadge}>{unreadCount}</div>
          )}
        </button>
      )}

      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Шапка как в Тинькофф */}
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderLeft}>
              <button
                onClick={() => setIsOpen(false)}
                className={styles.backBtn}
              >
                ←
              </button>
              <div className={styles.chatAvatar}>
                <div className={styles.avatarRing}>
                  <span>🤖</span>
                </div>
              </div>
              <div className={styles.chatInfo}>
                <h3>Поддержка</h3>
                <div className={styles.onlineStatus}>
                  <span className={styles.onlineDot}></span>
                  <span>Онлайн</span>
                </div>
              </div>
            </div>
            <div className={styles.chatHeaderRight}>
              {isAdmin && (
                <button
                  onClick={() => {
                    if (window.confirm("Очистить историю чата?")) {
                      localStorage.setItem("chatMessages", "[]");
                      setMessages([]);
                    }
                  }}
                  className={styles.clearBtn}
                >
                  🗑️
                </button>
              )}
            </div>
          </div>

          {/* Область сообщений */}
          <div className={styles.chatMessages}>
            {messages.length === 0 ? (
              <div className={styles.emptyChat}>
                <div className={styles.emptyIcon}>💬</div>
                <p>Напишите нам</p>
                <span>Мы ответим в ближайшее время</span>
              </div>
            ) : (
              <>
                {Object.entries(messageGroups).map(([date, dateMessages]) => (
                  <div key={date}>
                    <div className={styles.dateDivider}>
                      <span>
                        {date === new Date().toLocaleDateString()
                          ? "Сегодня"
                          : date}
                      </span>
                    </div>
                    {dateMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`${styles.messageGroup} ${msg.isFromUser ? styles.userMessageGroup : styles.adminMessageGroup}`}
                      >
                        {!msg.isFromUser && (
                          <div className={styles.messageAvatar}>
                            <div className={styles.smallAvatar}>🤖</div>
                          </div>
                        )}
                        <div className={styles.messageBubble}>
                          <div className={styles.messageText}>{msg.text}</div>
                          <div className={styles.messageTime}>
                            {msg.timestamp}
                          </div>
                        </div>
                        {msg.isFromUser && (
                          <div className={styles.messageAvatar}>
                            <div className={styles.userAvatar}>
                              {msg.userAvatar && msg.userAvatar.length > 1 ? (
                                <img src={msg.userAvatar} alt="" />
                              ) : (
                                msg.userAvatar
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Поле ввода как в Тинькофф */}
          <div className={styles.chatInput}>
            <div className={styles.inputWrapper}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Сообщение..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className={styles.sendBtn}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
