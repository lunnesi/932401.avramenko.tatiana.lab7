const db = require('./db');

// R (Read) — получить все задачи, сортировка по created_at DESC
function getAllTasks() {
  const stmt = db.prepare(`
    SELECT id, title, description, completed, created_at
    FROM tasks
    ORDER BY created_at DESC, id DESC
  `);
  return stmt.all();
}

// Вспомогательная функция — найти одну задачу по id
function getTaskById(id) {
  const stmt = db.prepare(`
    SELECT id, title, description, completed, created_at
    FROM tasks
    WHERE id = ?
  `);
  return stmt.get(id);
}

// C (Create) — создать новую задачу и вернуть её из БД
function createTask({ title, description = null }) {
  const stmt = db.prepare(`
    INSERT INTO tasks (title, description)
    VALUES (?, ?)
  `);
  const info = stmt.run(title, description);
  return getTaskById(info.lastInsertRowid);
}

// U (Update) — обновить ТОЛЬКО title, description, completed 
function updateTask(id, { title, description, completed }) {
  const existing = getTaskById(id);
  if (!existing) {
    return null;
  }

  const nextTitle = title !== undefined ? title : existing.title;
  const nextDescription = description !== undefined ? description : existing.description;

  let nextCompleted = existing.completed;
  if (completed !== undefined) {
    nextCompleted = completed ? 1 : 0;
  }

  const stmt = db.prepare(`
    UPDATE tasks
    SET title = ?, description = ?, completed = ?
    WHERE id = ?
  `);
  stmt.run(nextTitle, nextDescription, nextCompleted, id);

  return getTaskById(id);
}

// D (Delete) — удалить задачу по id
function deleteTask(id) {
  const stmt = db.prepare(`
    DELETE FROM tasks
    WHERE id = ?
  `);
  const info = stmt.run(id);
  return info.changes > 0;
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};