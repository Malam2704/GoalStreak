import { normalizeState } from "../state.js";

const getSupabaseClient = () => {
  if (!globalThis.supabase) {
    throw new Error(
      "Supabase client missing. Set globalThis.supabase = createClient(...)"
    );
  }
  return globalThis.supabase;
};

const mapTodo = (row) => ({
  id: row.id,
  text: row.text,
  createdAt: row.created_at
});

const mapTask = (row) => ({
  id: row.id,
  text: row.text,
  createdAt: row.created_at
});

const mapBlock = (row) => ({
  id: row.id,
  name: row.name,
  createdAt: row.created_at,
  tasks: Array.isArray(row.block_tasks) ? row.block_tasks.map(mapTask) : []
});

const mapTodayBlock = (row) => ({
  id: row.id,
  blockId: row.block_id,
  name: row.name,
  createdAt: row.created_at,
  tasks: Array.isArray(row.today_block_tasks)
    ? row.today_block_tasks.map(mapTask)
    : []
});

const ensureTasks = (tasks) => (Array.isArray(tasks) ? tasks : []);

const loadState = async () => {
  const supabase = getSupabaseClient();
  const [todosRes, blocksRes, todayBlocksRes] = await Promise.all([
    supabase.from("todos").select("id,text,created_at").order("created_at", {
      ascending: false
    }),
    supabase
      .from("blocks")
      .select("id,name,created_at,block_tasks(id,text,created_at)")
      .order("created_at", { ascending: false })
      .order("created_at", { foreignTable: "block_tasks", ascending: true }),
    supabase
      .from("today_blocks")
      .select("id,block_id,name,created_at,today_block_tasks(id,text,created_at)")
      .order("created_at", { ascending: false })
      .order("created_at", {
        foreignTable: "today_block_tasks",
        ascending: true
      })
  ]);

  if (todosRes.error) {
    throw todosRes.error;
  }
  if (blocksRes.error) {
    throw blocksRes.error;
  }
  if (todayBlocksRes.error) {
    throw todayBlocksRes.error;
  }

  return {
    todos: (todosRes.data || []).map(mapTodo),
    blocks: (blocksRes.data || []).map(mapBlock),
    todayBlocks: (todayBlocksRes.data || []).map(mapTodayBlock)
  };
};

const addTodo = async (state, text) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("todos")
    .insert({ text })
    .select("id,text,created_at")
    .single();

  if (error) {
    throw error;
  }

  const current = normalizeState(state);
  return { ...current, todos: [mapTodo(data), ...current.todos] };
};

const deleteTodo = async (state, id) => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("todos").delete().eq("id", id);

  if (error) {
    throw error;
  }

  const current = normalizeState(state);
  return {
    ...current,
    todos: current.todos.filter((item) => item.id !== id)
  };
};

const createBlock = async (state, name) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("blocks")
    .insert({ name })
    .select("id,name,created_at")
    .single();

  if (error) {
    throw error;
  }

  const current = normalizeState(state);
  return {
    ...current,
    blocks: [
      {
        id: data.id,
        name: data.name,
        createdAt: data.created_at,
        tasks: []
      },
      ...current.blocks
    ]
  };
};

const deleteBlock = async (state, blockId) => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("blocks").delete().eq("id", blockId);

  if (error) {
    throw error;
  }

  const current = normalizeState(state);
  return {
    ...current,
    blocks: current.blocks.filter((block) => block.id !== blockId),
    todayBlocks: current.todayBlocks.filter((block) => block.blockId !== blockId)
  };
};

const addBlockTask = async (state, blockId, text) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("block_tasks")
    .insert({ block_id: blockId, text })
    .select("id,text,created_at")
    .single();

  if (error) {
    throw error;
  }

  const current = normalizeState(state);
  return {
    ...current,
    blocks: current.blocks.map((block) =>
      block.id === blockId
        ? { ...block, tasks: [...ensureTasks(block.tasks), mapTask(data)] }
        : block
    )
  };
};

const deleteBlockTask = async (state, blockId, taskId) => {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("block_tasks")
    .delete()
    .eq("id", taskId)
    .eq("block_id", blockId);

  if (error) {
    throw error;
  }

  const current = normalizeState(state);
  return {
    ...current,
    blocks: current.blocks.map((block) =>
      block.id === blockId
        ? {
            ...block,
            tasks: ensureTasks(block.tasks).filter((task) => task.id !== taskId)
          }
        : block
    )
  };
};

const addBlockToToday = async (state, blockId) => {
  const current = normalizeState(state);
  const template = current.blocks.find((block) => block.id === blockId);
  if (!template) {
    return current;
  }

  const supabase = getSupabaseClient();
  const { data: todayBlock, error } = await supabase
    .from("today_blocks")
    .insert({ block_id: template.id, name: template.name })
    .select("id,block_id,name,created_at")
    .single();

  if (error) {
    throw error;
  }

  let taskRows = [];
  if (template.tasks.length > 0) {
    const { data, error: taskError } = await supabase
      .from("today_block_tasks")
      .insert(
        template.tasks.map((task) => ({
          today_block_id: todayBlock.id,
          text: task.text
        }))
      )
      .select("id,text,created_at");

    if (taskError) {
      throw taskError;
    }
    taskRows = data || [];
  }

  const instance = {
    id: todayBlock.id,
    blockId: todayBlock.block_id,
    name: todayBlock.name,
    createdAt: todayBlock.created_at,
    tasks: taskRows.map(mapTask)
  };

  return {
    ...current,
    todayBlocks: [instance, ...current.todayBlocks]
  };
};

const removeTodayBlock = async (state, todayBlockId) => {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("today_blocks")
    .delete()
    .eq("id", todayBlockId);

  if (error) {
    throw error;
  }

  const current = normalizeState(state);
  return {
    ...current,
    todayBlocks: current.todayBlocks.filter((block) => block.id !== todayBlockId)
  };
};

const addTodayBlockTask = async (state, todayBlockId, text) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("today_block_tasks")
    .insert({ today_block_id: todayBlockId, text })
    .select("id,text,created_at")
    .single();

  if (error) {
    throw error;
  }

  const current = normalizeState(state);
  return {
    ...current,
    todayBlocks: current.todayBlocks.map((block) =>
      block.id === todayBlockId
        ? { ...block, tasks: [...ensureTasks(block.tasks), mapTask(data)] }
        : block
    )
  };
};

const deleteTodayBlockTask = async (state, todayBlockId, taskId) => {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("today_block_tasks")
    .delete()
    .eq("id", taskId)
    .eq("today_block_id", todayBlockId);

  if (error) {
    throw error;
  }

  const current = normalizeState(state);
  return {
    ...current,
    todayBlocks: current.todayBlocks.map((block) =>
      block.id === todayBlockId
        ? {
            ...block,
            tasks: ensureTasks(block.tasks).filter((task) => task.id !== taskId)
          }
        : block
    )
  };
};

export const supabaseAdapter = {
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
