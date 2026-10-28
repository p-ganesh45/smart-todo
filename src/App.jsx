
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem("smart-todo-tasks");
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("smart-todo-tasks", JSON.stringify(tasks));
  }, [tasks]);

  function resetForm() {
    setTask("");
    setPriority("Medium");
    setDueDate("");
    setEditingId(null);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!task.trim()) {
      alert("Please enter a task!");
      return;
    }

    if (editingId !== null) {
      setTasks((previousTasks) =>
        previousTasks.map((item) =>
          item.id === editingId
            ? {
                ...item,
                text: task.trim(),
                priority,
                dueDate,
              }
            : item
        )
      );
    } else {
      const newTask = {
        id: Date.now(),
        text: task.trim(),
        completed: false,
        priority,
        dueDate,
      };

      setTasks((previousTasks) => [...previousTasks, newTask]);
    }

    resetForm();
  }

  function editTask(item) {
    setTask(item.text);
    setPriority(item.priority || "Medium");
    setDueDate(item.dueDate || "");
    setEditingId(item.id);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleTask(id) {
    setTasks((previousTasks) =>
      previousTasks.map((item) =>
        item.id === id
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  }

  function deleteTask(id) {
    setTasks((previousTasks) =>
      previousTasks.filter((item) => item.id !== id)
    );

    if (editingId === id) {
      resetForm();
    }
  }

  function clearCompleted() {
    if (window.confirm("Delete all completed tasks?")) {
      setTasks((previousTasks) =>
        previousTasks.filter((item) => !item.completed)
      );
    }
  }

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const filteredTasks = tasks.filter((item) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Pending" && !item.completed) ||
      (filter === "Completed" && item.completed);

    const matchesSearch = item.text
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const pendingCount = tasks.filter(
    (item) => !item.completed
  ).length;

  const completedCount = tasks.filter(
    (item) => item.completed
  ).length;

  const overdueCount = tasks.filter(
    (item) =>
      !item.completed &&
      item.dueDate &&
      item.dueDate < todayString
  ).length;

  return (
    <div className="app">
      <main className="todo-container">
        <header className="header">
          <div className="app-icon">✓</div>
          <h1>Smart To-Do List</h1>
          <p className="subtitle">
            Organize your day, one task at a time.
          </p>
        </header>

        <section className="task-form-section">
          <h2>{editingId !== null ? "Edit Task" : "Add a New Task"}</h2>

          <form className="task-input" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="What do you need to do?"
              value={task}
              onChange={(event) => setTask(event.target.value)}
              aria-label="Task name"
              maxLength={200}
            />

            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              aria-label="Task priority"
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <input
              type="date"
              value={dueDate}
              min={todayString}
              onChange={(event) => setDueDate(event.target.value)}
              aria-label="Task due date"
              title="Optional due date"
            />

            <button className="add-btn" type="submit">
              {editingId !== null ? "Save Changes" : "+ Add Task"}
            </button>

            {editingId !== null && (
              <button
                className="cancel-btn"
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </form>
        </section>

        <section className="task-controls">
          <div className="search-box">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search your tasks..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search tasks"
            />
          </div>

          <div className="filters">
            {["All", "Pending", "Completed"].map((item) => (
              <button
                type="button"
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {overdueCount > 0 && (
          <div className="overdue-alert">
            <span>⚠</span>
            You have {overdueCount} overdue{" "}
            {overdueCount === 1 ? "task" : "tasks"}.
          </div>
        )}

        <section className="task-list">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>
                {search
                  ? "No matching tasks"
                  : "No tasks found"}
              </h3>
              <p>
                {search
                  ? "Try a different search term."
                  : "Add a task above to get started!"}
              </p>
            </div>
          ) : (
            filteredTasks.map((item) => {
              const itemPriority = item.priority || "Medium";
              const isOverdue =
                !item.completed &&
                item.dueDate &&
                item.dueDate < todayString;

              return (
                <article
                  className={`task-item ${
                    item.completed ? "task-done" : ""
                  }`}
                  key={item.id}
                >
                  <label className="task-label">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleTask(item.id)}
                      aria-label={`Mark ${item.text} as ${
                        item.completed ? "pending" : "completed"
                      }`}
                    />

                    <span
                      className={
                        item.completed ? "completed" : ""
                      }
                    >
                      {item.text}
                    </span>
                  </label>

                  <div className="task-meta">
                    <span
                      className={`priority-badge priority-${itemPriority.toLowerCase()}`}
                    >
                      {itemPriority}
                    </span>

                    {item.dueDate && (
                      <span
                        className={`due-date ${
                          isOverdue ? "overdue" : ""
                        }`}
                      >
                        {isOverdue ? "Overdue: " : "Due: "}
                        {item.dueDate}
                      </span>
                    )}
                  </div>

                  <div className="task-actions">
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => editTask(item)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => deleteTask(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>

        <section className="task-summary">
          <div className="summary-card">
            <span className="summary-number">{tasks.length}</span>
            <span className="summary-label">Total Tasks</span>
          </div>

          <div className="summary-card">
            <span className="summary-number pending-number">
              {pendingCount}
            </span>
            <span className="summary-label">Pending</span>
          </div>

          <div className="summary-card">
            <span className="summary-number completed-number">
              {completedCount}
            </span>
            <span className="summary-label">Completed</span>
          </div>
        </section>

        {completedCount > 0 && (
          <div className="clear-completed">
            <button type="button" onClick={clearCompleted}>
              Clear Completed Tasks
            </button>
          </div>
        )}

        <footer className="footer">
          <p>Stay focused. One task at a time!</p>
          <span>Smart To-Do List · Built with React</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
