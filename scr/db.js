const path = require('path');
const Database = require('better-sqlite3');

// Файл базы данных будет лежать в корне проекта: lab-sqlite-express/tasks.db
const dbPath = path.join(__dirname, '..', 'tasks.db');
const db = new Database(dbPath);

// Создаём таблицу tasks, если её ещё нет
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;