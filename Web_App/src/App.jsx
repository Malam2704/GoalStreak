import { useEffect, useMemo, useRef, useState } from "react";
import { dataClient } from "./data/dataClient.js";
import { EMPTY_STATE } from "./data/state.js";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });

const getLatestTimestamp = (items) => {
  const latest = items.reduce((current, value) => {
    if (!value) {
      return current;
    }
    if (!current) {
      return value;
    }
    return new Date(value).getTime() > new Date(current).getTime()
      ? value
      : current;
  }, null);

  return latest;
};

function App() {
  const [state, setState] = useState(EMPTY_STATE);
  const [text, setText] = useState("");
  const [blockName, setBlockName] = useState("");
  const [blockInputs, setBlockInputs] = useState({});
  const [todayBlockInputs, setTodayBlockInputs] = useState({});
  const stateRef = useRef(state);

  const { todos, blocks, todayBlocks } = state;

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let active = true;

    Promise.resolve(dataClient.loadState())
      .then((loaded) => {
        if (active) {
          setState(loaded);
        }
      })
      .catch((error) => {
        console.error("Failed to load data", error);
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const blockTaskCount = todayBlocks.reduce(
      (total, block) => total + block.tasks.length,
      0
    );
    const timestamps = [
      ...todos.map((todo) => todo.createdAt),
      ...todayBlocks.flatMap((block) => [
        block.createdAt,
        ...block.tasks.map((task) => task.createdAt)
      ])
    ];

    return {
      count: todos.length + blockTaskCount,
      blocks: todayBlocks.length,
      latest: getLatestTimestamp(timestamps)
    };
  }, [todos, todayBlocks]);

  const runAction = async (action) => {
    try {
      const next = await action(stateRef.current);
      setState(next);
      return true;
    } catch (error) {
      console.error("Failed to update data", error);
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value) {
      return;
    }

    const ok = await runAction((current) => dataClient.addTodo(current, value));
    if (ok) {
      setText("");
    }
  };

  const handleDelete = async (id) => {
    await runAction((current) => dataClient.deleteTodo(current, id));
  };

  const handleCreateBlock = async (event) => {
    event.preventDefault();
    const value = blockName.trim();
    if (!value) {
      return;
    }

    const ok = await runAction((current) =>
      dataClient.createBlock(current, value)
    );
    if (ok) {
      setBlockName("");
    }
  };

  const handleAddBlockTask = async (event, blockId) => {
    event.preventDefault();
    const value = (blockInputs[blockId] || "").trim();
    if (!value) {
      return;
    }

    const ok = await runAction((current) =>
      dataClient.addBlockTask(current, blockId, value)
    );
    if (ok) {
      setBlockInputs((prev) => ({ ...prev, [blockId]: "" }));
    }
  };

  const handleDeleteBlockTask = async (blockId, taskId) => {
    await runAction((current) =>
      dataClient.deleteBlockTask(current, blockId, taskId)
    );
  };

  const handleAddBlockToToday = async (blockId) => {
    await runAction((current) =>
      dataClient.addBlockToToday(current, blockId)
    );
  };

  const handleRemoveBlock = async (blockId) => {
    const ok = await runAction((current) =>
      dataClient.deleteBlock(current, blockId)
    );
    if (ok) {
      setBlockInputs((prev) => {
        const next = { ...prev };
        delete next[blockId];
        return next;
      });
    }
  };

  const handleRemoveTodayBlock = async (blockId) => {
    const ok = await runAction((current) =>
      dataClient.removeTodayBlock(current, blockId)
    );
    if (ok) {
      setTodayBlockInputs((prev) => {
        const next = { ...prev };
        delete next[blockId];
        return next;
      });
    }
  };

  const handleAddTodayBlockTask = async (event, blockId) => {
    event.preventDefault();
    const value = (todayBlockInputs[blockId] || "").trim();
    if (!value) {
      return;
    }

    const ok = await runAction((current) =>
      dataClient.addTodayBlockTask(current, blockId, value)
    );
    if (ok) {
      setTodayBlockInputs((prev) => ({ ...prev, [blockId]: "" }));
    }
  };

  const handleDeleteTodayBlockTask = async (blockId, taskId) => {
    await runAction((current) =>
      dataClient.deleteTodayBlockTask(current, blockId, taskId)
    );
  };

  return (
    <div className="app">
      <main className="card">
        <header className="header">
          <p className="eyebrow">GoalStreak</p>
          <h1>Today&apos;s focus</h1>
          <p className="subtitle">
            Mix one-off tasks with reusable blocks. Local-first, Supabase-ready.
          </p>
        </header>

        <section className="section">
          <div className="section-head">
            <div>
              <p className="section-title">Today</p>
              <p className="section-subtitle">
                Standalone tasks you want to finish today.
              </p>
            </div>
          </div>

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
            <button type="submit">Add task</button>
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
                      <p className="item-meta">
                        Added {formatDate(todo.createdAt)}
                      </p>
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
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <p className="section-title">Blocks</p>
              <p className="section-subtitle">
                Create reusable routines you can add every day.
              </p>
            </div>
          </div>

          <form className="composer" onSubmit={handleCreateBlock}>
            <label className="sr-only" htmlFor="block-input">
              Add a new block
            </label>
            <input
              id="block-input"
              type="text"
              value={blockName}
              onChange={(event) => setBlockName(event.target.value)}
              placeholder="Block name (e.g. Morning reset)"
              autoComplete="off"
            />
            <button type="submit">Create block</button>
          </form>

          <div className="block-grid">
            {blocks.length === 0 ? (
              <p className="empty">
                No blocks yet. Create one to reuse across days.
              </p>
            ) : (
              blocks.map((block) => (
                <article key={block.id} className="block-card">
                  <header className="block-header">
                    <div>
                      <h3>{block.name}</h3>
                      <p className="item-meta">
                        {block.tasks.length} task
                        {block.tasks.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="block-actions">
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => handleAddBlockToToday(block.id)}
                      >
                        Add to today
                      </button>
                      <button
                        type="button"
                        className="ghost subtle"
                        onClick={() => handleRemoveBlock(block.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </header>

                  {block.tasks.length === 0 ? (
                    <p className="empty compact">
                      Add tasks to this block to make it reusable.
                    </p>
                  ) : (
                    <ul className="task-list">
                      {block.tasks.map((task) => (
                        <li key={task.id} className="task-row">
                          <span>{task.text}</span>
                          <button
                            type="button"
                            className="ghost tiny"
                            onClick={() =>
                              handleDeleteBlockTask(block.id, task.id)
                            }
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <form
                    className="mini-form"
                    onSubmit={(event) => handleAddBlockTask(event, block.id)}
                  >
                    <input
                      type="text"
                      value={blockInputs[block.id] || ""}
                      onChange={(event) =>
                        setBlockInputs((prev) => ({
                          ...prev,
                          [block.id]: event.target.value
                        }))
                      }
                      placeholder="Add a task to this block"
                      autoComplete="off"
                    />
                    <button type="submit">Add</button>
                  </form>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <p className="section-title">Today&apos;s blocks</p>
              <p className="section-subtitle">
                Blocks you activated for the current day.
              </p>
            </div>
          </div>

          {todayBlocks.length === 0 ? (
            <p className="empty">
              No blocks added today. Tap “Add to today” to drop one in.
            </p>
          ) : (
            <div className="block-grid">
              {todayBlocks.map((block) => (
                <article key={block.id} className="block-card active">
                  <header className="block-header">
                    <div>
                      <h3>{block.name}</h3>
                      <p className="item-meta">
                        Added {formatDate(block.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="ghost subtle"
                      onClick={() => handleRemoveTodayBlock(block.id)}
                    >
                      Remove
                    </button>
                  </header>

                  {block.tasks.length === 0 ? (
                    <p className="empty compact">
                      No tasks yet. Add one below.
                    </p>
                  ) : (
                    <ul className="task-list">
                      {block.tasks.map((task) => (
                        <li key={task.id} className="task-row">
                          <span>{task.text}</span>
                          <button
                            type="button"
                            className="ghost tiny"
                            onClick={() =>
                              handleDeleteTodayBlockTask(block.id, task.id)
                            }
                          >
                            Done
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <form
                    className="mini-form"
                    onSubmit={(event) => handleAddTodayBlockTask(event, block.id)}
                  >
                    <input
                      type="text"
                      value={todayBlockInputs[block.id] || ""}
                      onChange={(event) =>
                        setTodayBlockInputs((prev) => ({
                          ...prev,
                          [block.id]: event.target.value
                        }))
                      }
                      placeholder="Add a task for today"
                      autoComplete="off"
                    />
                    <button type="submit">Add</button>
                  </form>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="footer">
          <span>
            {stats.count} item{stats.count === 1 ? "" : "s"}
          </span>
          <span>
            {stats.blocks} block{stats.blocks === 1 ? "" : "s"} today
          </span>
          <span>
            {stats.latest ? `Last added ${formatDate(stats.latest)}` : "Ready"}
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
