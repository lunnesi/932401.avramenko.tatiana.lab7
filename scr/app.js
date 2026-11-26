const express = require('express');
const {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('./tasksRepo');

const app = express();
const PORT = process.env.PORT || 3000;

// Позволяет Express понимать JSON в теле запроса (req.body)
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Проверка, что id в URL — положительное целое число
function parseTaskId(rawId) {
  if (!/^\d+$/.test(rawId)) {
    return null;
  }
  const id = Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// GET /api/tasks — список задач (сортировка по created_at DESC)
app.get('/api/tasks', (req, res) => {
  const tasks = getAllTasks();
  res.status(200).json(tasks);
});

// POST /api/tasks — создание задачи; пустой title -> 400
app.post('/api/tasks', (req, res) => {
  const { title, description } = req.body || {};

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Поле title обязательно и не должно быть пустым' });
  }

  const cleanDescription =
    description === undefined || description === null ? null : String(description);

  const created = createTask({
    title: title.trim(),
    description: cleanDescription,
  });

  res.status(201).json(created);
});

// PUT /api/tasks/:id — обновляем только title, description, completed; created_at не меняется
app.put('/api/tasks/:id', (req, res) => {
  const id = parseTaskId(req.params.id);
  if (!id) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  const body = req.body || {};

  if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim() === '')) {
    return res.status(400).json({ error: 'Поле title не должно быть пустым' });
  }

  const payload = {};
  if (body.title !== undefined) payload.title = body.title.trim();
  if (body.description !== undefined) {
    payload.description = body.description === null ? null : String(body.description);
  }
  if (body.completed !== undefined) {
    if (typeof body.completed === 'boolean') {
      payload.completed = body.completed;
    } else if (body.completed === 0 || body.completed === 1 || body.completed === '0' || body.completed === '1') {
      payload.completed = body.completed === 1 || body.completed === '1';
    } else {
      return res.status(400).json({ error: 'Поле completed должно быть булевым или 0/1' });
    }
  }

  const updated = updateTask(id, payload);
  if (!updated) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  res.status(200).json(updated);
});

// DELETE /api/tasks/:id — удаление задачи; неверный ID -> 404
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseTaskId(req.params.id);
  if (!id) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  const deleted = deleteTask(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Задача не найдена' });
  }

  res.status(200).json({ message: 'Задача удалена', id });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
