import React, { useState, useEffect } from "react";
import styles from "./KanbanBoard.module.css";

const KanbanBoard = ({ board, onBack, onUpdateBoard }) => {
  const [columns, setColumns] = useState(board.columns);
  const [showTaskForm, setShowTaskForm] = useState(null);
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });

  // Drag and Drop состояния
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Сохраняем изменения при обновлении колонок
  useEffect(() => {
    const updatedBoard = { ...board, columns };
    onUpdateBoard(updatedBoard);
  }, [columns]);

  // Добавление колонки
  const addColumn = () => {
    if (newColumnTitle.trim()) {
      const newColumn = {
        id: Date.now(),
        title: newColumnTitle.trim(),
        tasks: [],
      };
      setColumns([...columns, newColumn]);
      setNewColumnTitle("");
      setShowColumnForm(false);
    }
  };

  // Удаление колонки
  const deleteColumn = (columnId) => {
    if (window.confirm("Удалить колонку?")) {
      setColumns(columns.filter((col) => col.id !== columnId));
    }
  };

  // Добавление задачи
  const addTask = (columnId) => {
    if (newTask.title.trim()) {
      const task = {
        id: Date.now(),
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        priority: newTask.priority,
        dueDate: newTask.dueDate || new Date().toISOString().split("T")[0],
      };

      setColumns(
        columns.map((col) =>
          col.id === columnId ? { ...col, tasks: [...col.tasks, task] } : col,
        ),
      );

      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
      });
      setShowTaskForm(null);
    }
  };

  // Удаление задачи
  const deleteTask = (columnId, taskId) => {
    if (window.confirm("Удалить задачу?")) {
      setColumns(
        columns.map((col) =>
          col.id === columnId
            ? { ...col, tasks: col.tasks.filter((task) => task.id !== taskId) }
            : col,
        ),
      );
    }
  };

  // Drag and Drop функции
  const handleDragStart = (e, task, sourceColumnId) => {
    setDraggedTask({ task, sourceColumnId });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = (e) => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOverColumn = (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDropOnColumn = (e, targetColumnId) => {
    e.preventDefault();
    if (!draggedTask) return;

    const { task, sourceColumnId } = draggedTask;
    if (sourceColumnId !== targetColumnId) {
      moveTask(task.id, sourceColumnId, targetColumnId);
    }

    setDragOverColumn(null);
    setDraggedTask(null);
  };

  const moveTask = (taskId, sourceColumnId, targetColumnId) => {
    let movedTask = null;
    let newColumns = [...columns];

    const sourceIndex = newColumns.findIndex(
      (col) => col.id === sourceColumnId,
    );
    const taskIndex = newColumns[sourceIndex].tasks.findIndex(
      (t) => t.id === taskId,
    );
    movedTask = newColumns[sourceIndex].tasks[taskIndex];
    newColumns[sourceIndex].tasks.splice(taskIndex, 1);

    const targetIndex = newColumns.findIndex(
      (col) => col.id === targetColumnId,
    );
    newColumns[targetIndex].tasks.push(movedTask);

    setColumns(newColumns);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return styles.priorityHigh;
      case "medium":
        return styles.priorityMedium;
      case "low":
        return styles.priorityLow;
      default:
        return styles.priorityMedium;
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case "high":
        return "Высокий";
      case "medium":
        return "Средний";
      case "low":
        return "Низкий";
      default:
        return "Средний";
    }
  };

  return (
    <div className={styles.kanbanContainer}>
      <div className={styles.boardHeader}>
        <button onClick={onBack} className={styles.backBtn}>
          ← Назад к доскам
        </button>
        <div className={styles.boardInfo}>
          <div
            className={styles.boardIcon}
            style={{ backgroundColor: board.color + "20" }}
          >
            {board.icon}
          </div>
          <div>
            <h1 className={styles.boardTitle}>{board.name}</h1>
            <p className={styles.boardDescription}>{board.description}</p>
          </div>
        </div>
        <button
          className={styles.addColumnBtn}
          onClick={() => setShowColumnForm(true)}
        >
          + Колонка
        </button>
      </div>

      {showColumnForm && (
        <div className={styles.addColumnForm}>
          <input
            type="text"
            placeholder="Название колонки"
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addColumn()}
            autoFocus
          />
          <button onClick={addColumn}>Добавить</button>
          <button onClick={() => setShowColumnForm(false)}>Отмена</button>
        </div>
      )}

      <div className={styles.kanbanBoard}>
        {columns.map((column) => (
          <div
            key={column.id}
            className={`${styles.column} ${dragOverColumn === column.id ? styles.columnDragOver : ""}`}
            onDragOver={(e) => handleDragOverColumn(e, column.id)}
            onDrop={(e) => handleDropOnColumn(e, column.id)}
          >
            <div className={styles.columnHeader}>
              <div className={styles.columnTitleWrapper}>
                <h3 className={styles.columnTitle}>{column.title}</h3>
                <span className={styles.taskCount}>{column.tasks.length}</span>
              </div>
              <button
                onClick={() => deleteColumn(column.id)}
                className={styles.deleteColumnBtn}
              >
                ✕
              </button>
            </div>

            <div className={styles.taskList}>
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  className={styles.taskCard}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task, column.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className={styles.taskHeader}>
                    <h4 className={styles.taskTitle}>{task.title}</h4>
                    <button
                      onClick={() => deleteTask(column.id, task.id)}
                      className={styles.deleteTaskBtn}
                    >
                      ✕
                    </button>
                  </div>
                  <p className={styles.taskDescription}>{task.description}</p>
                  <div className={styles.taskMeta}>
                    <span className={getPriorityColor(task.priority)}>
                      {getPriorityText(task.priority)}
                    </span>
                    <span className={styles.dueDate}>📅 {task.dueDate}</span>
                  </div>
                  <div className={styles.dragHint}>↕️ Перетащите</div>
                </div>
              ))}

              {column.tasks.length === 0 && (
                <div className={styles.emptyColumn}>
                  <p>Нет задач</p>
                  <small>Перетащите или создайте</small>
                </div>
              )}
            </div>

            {showTaskForm === column.id ? (
              <div className={styles.addTaskForm}>
                <input
                  type="text"
                  placeholder="Название задачи*"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  autoFocus
                />
                <textarea
                  placeholder="Описание"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  rows="2"
                />
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value })
                  }
                >
                  <option value="high">Высокий</option>
                  <option value="medium">Средний</option>
                  <option value="low">Низкий</option>
                </select>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                />
                <div className={styles.formButtons}>
                  <button onClick={() => addTask(column.id)}>Добавить</button>
                  <button onClick={() => setShowTaskForm(null)}>Отмена</button>
                </div>
              </div>
            ) : (
              <button
                className={styles.addTaskButton}
                onClick={() => setShowTaskForm(column.id)}
              >
                + Добавить задачу
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
