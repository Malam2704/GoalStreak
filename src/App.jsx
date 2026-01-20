import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "goalstreak.todos.v1";

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const loadTodos = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to load todos", error);
    return [];
  }
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });

function App() {
  const [todos, setTodos] = useState(loadTodos);
  const [text, setText] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const stats = useMemo(
    () => ({ count: todos.length, latest: todos[0]?.createdAt }),
    [todos]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value) {
      return;
    }

    setTodos((prev) => [
      { id: createId(), text: value, createdAt: new Date().toISOString() },
      ...prev
    ]);
    setText("");
  };

  const handleDelete = (id) => {
    setTodos((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="app">
      <main className="card">
        <header className="header">
          <p className="eyebrow">GoalStreak</p>
          <h1>Today&apos;s focus</h1>
          <p className="subtitle">
            Add a task, knock it out, keep momentum. Everything saves locally in
            your browser.
          </p>
        </header>

        <form className="composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="todo-input">
            Add a new task
          </label>
          <input
            id="todo-input"
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="What needs to happen next?"
            autoComplete="off"
          />
          <button type="submit">Add</button>
        </form>

        <section className="list" aria-live="polite">
          {todos.length === 0 ? (
            <p className="empty">No tasks yet. Start with one small win.</p>
          ) : (
            <ul>
              {todos.map((todo, index) => (
                <li
                  key={todo.id}
                  className="item"
                  style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}
                >
                  <div>
                    <p className="item-text">{todo.text}</p>
                    <p className="item-meta">Added {formatDate(todo.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => handleDelete(todo.id)}
                    aria-label={`Delete ${todo.text}`}
                  >
                    Done
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="footer">
          <span>{stats.count} item{stats.count === 1 ? "" : "s"}</span>
          <span>
            {stats.latest ? `Last added ${formatDate(stats.latest)}` : "Ready"}
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
