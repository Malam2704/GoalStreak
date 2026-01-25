import { normalizeState } from "../state.js";

const STORAGE_KEY = "goalstreak.data.v2";

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createTask = (text) => ({
  id: createId(),
  text,
  createdAt: new Date().toISOString()
});

const ensureState = (state) => normalizeState(state);

const persistState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const loadState = async () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return normalizeState(raw ? JSON.parse(raw) : null);
  } catch (error) {
    console.error("Failed to load local data", error);
    return normalizeState(null);
  }
};

const addTodo = async (state, text) => {
  const current = ensureState(state);
  const next = {
    ...current,
    todos: [createTask(text), ...current.todos]
  };
  persistState(next);
  return next;
};

const deleteTodo = async (state, id) => {
  const current = ensureState(state);
  const next = {
    ...current,
    todos: current.todos.filter((item) => item.id !== id)
  };
  persistState(next);
  return next;
};

const createBlock = async (state, name) => {
  const current = ensureState(state);
  const next = {
    ...current,
    blocks: [
      { id: createId(), name, tasks: [], createdAt: new Date().toISOString() },
      ...current.blocks
    ]
  };
  persistState(next);
  return next;
};

const deleteBlock = async (state, blockId) => {
  const current = ensureState(state);
  const next = {
    ...current,
    blocks: current.blocks.filter((block) => block.id !== blockId),
    todayBlocks: current.todayBlocks.filter((block) => block.blockId !== blockId)
  };
  persistState(next);
  return next;
};

const addBlockTask = async (state, blockId, text) => {
  const current = ensureState(state);
  const next = {
    ...current,
    blocks: current.blocks.map((block) => {
      if (block.id !== blockId) {
        return block;
      }
      const tasks = Array.isArray(block.tasks) ? block.tasks : [];
      return {
        ...block,
        tasks: [...tasks, createTask(text)]
      };
    })
  };
  persistState(next);
  return next;
};

const deleteBlockTask = async (state, blockId, taskId) => {
  const current = ensureState(state);
  const next = {
    ...current,
    blocks: current.blocks.map((block) =>
      block.id === blockId
        ? {
            ...block,
            tasks: (block.tasks || []).filter((task) => task.id !== taskId)
          }
        : block
    )
  };
  persistState(next);
  return next;
};

const addBlockToToday = async (state, blockId) => {
  const current = ensureState(state);
  const template = current.blocks.find((block) => block.id === blockId);
  if (!template) {
    return current;
  }

  const timestamp = new Date().toISOString();
  const templateTasks = Array.isArray(template.tasks) ? template.tasks : [];
  const instance = {
    id: createId(),
    blockId: template.id,
    name: template.name,
    createdAt: timestamp,
    tasks: templateTasks.map((task) => ({
      id: createId(),
      text: task.text,
      createdAt: timestamp
    }))
  };

  const next = {
    ...current,
    todayBlocks: [instance, ...current.todayBlocks]
  };
  persistState(next);
  return next;
};

const removeTodayBlock = async (state, todayBlockId) => {
  const current = ensureState(state);
  const next = {
    ...current,
    todayBlocks: current.todayBlocks.filter((block) => block.id !== todayBlockId)
  };
  persistState(next);
  return next;
};

const addTodayBlockTask = async (state, todayBlockId, text) => {
  const current = ensureState(state);
  const next = {
    ...current,
    todayBlocks: current.todayBlocks.map((block) =>
      block.id === todayBlockId
        ? {
            ...block,
            tasks: [...(block.tasks || []), createTask(text)]
          }
        : block
    )
  };
  persistState(next);
  return next;
};

const deleteTodayBlockTask = async (state, todayBlockId, taskId) => {
  const current = ensureState(state);
  const next = {
    ...current,
    todayBlocks: current.todayBlocks.map((block) =>
      block.id === todayBlockId
        ? {
            ...block,
            tasks: (block.tasks || []).filter((task) => task.id !== taskId)
          }
        : block
    )
  };
  persistState(next);
  return next;
};

export const localAdapter = {
  loadState,
  addTodo,
  deleteTodo,
  createBlock,
  deleteBlock,
  addBlockTask,
  deleteBlockTask,
  addBlockToToday,
  removeTodayBlock,
  addTodayBlockTask,
  deleteTodayBlockTask
};
