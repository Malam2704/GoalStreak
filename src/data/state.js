const createEmptyState = () => ({
  todos: [],
  blocks: [],
  todayBlocks: []
});

export const EMPTY_STATE = createEmptyState();

export const normalizeState = (value) => {
  if (!value) {
    return createEmptyState();
  }

  if (Array.isArray(value)) {
    return {
      todos: value,
      blocks: [],
      todayBlocks: []
    };
  }

  const safeArray = (list) => (Array.isArray(list) ? list : []);

  return {
    todos: safeArray(value.todos),
    blocks: safeArray(value.blocks),
    todayBlocks: safeArray(value.todayBlocks)
  };
};
