# Лабораторная работа: REST API управления задачами на Express и SQLite

Небольшой бэкенд-сервис на **Node.js**, **Express** и **`better-sqlite3`** для работы с задачами (`tasks`) через REST API. Данные сохраняются в локальной базе SQLite в файле `tasks.db`.

## Стек технологий

* **Node.js** — серверная среда выполнения JavaScript
* **Express** — веб-фреймворк для обработки HTTP-запросов и маршрутизации
* **better-sqlite3** — синхронная библиотека для работы с базой данных SQLite
* **SQLite** — локальная файловая база данных (`tasks.db`)

## Структура проекта

```text
lab-sqlite-express/
├── src/
│   ├── app.js          # HTTP-сервер Express, маршруты, валидация, коды ответов
│   ├── tasksRepo.js    # Слой работы с данными (CRUD-функции и SQL-запросы)
│   └── db.js           # Подключение к SQLite и создание таблицы tasks
├── tasks.db            # Файл базы данных SQLite (создаётся автоматически при запуске)
├── package.json        # Зависимости и метаданные проекта
└── package-lock.json   # Зафиксированные версии установленных пакетов
```
## За что отвечает каждый файл:
| Файл | Назначение |
| :--- | :--- |
|src/db.js | создаёт или открывает файл tasks.db в корне проекта и гарантирует наличие таблицы tasks (CREATE TABLE IF NOT EXISTS tasks). Экспортирует экземпляр подключения db.|
|src/tasksRepo.js | инкапсулирует операции создания, чтения, обновления и удаления записей (CRUD) с помощью параметризованных SQL-запросов (?). Не зависит от HTTP-объектов req и res.|
|src/app.js | подключает express.json(), проверяет входные параметры и тело запросов, вызывает функции из tasksRepo.js и возвращает клиенту JSON и корректные HTTP-статусы (200, 201, 400, 404).|

## База данных и схема таблицы tasks
При первом запуске src/db.js создаёт таблицу tasks со следующей структурой:
| Поле | Тип | Описание |
| :--- | :--- | :--- |
|id	|INTEGER PRIMARY KEY AUTOINCREMENT	|Уникальный идентификатор задачи, генерируется автоматически|
|title	|TEXT NOT NULL	|Название задачи (обязательное поле, не может быть пустым)|
|description |TEXT	|Описание задачи (необязательное поле, может быть null)|
|completed	| BOOLEAN DEFAULT 0	|Флаг выполнения (0 — не выполнено, 1 — выполнено); по умолчанию 0|
|created_at	| DATETIME DEFAULT CURRENT_TIMESTAMP	|Дата и время создания записи; задаётся базой автоматически и не изменяется при обновлении|

## Установка и запуск с GitHub

### Предварительные требования
* Установленный **Git**
* Установленный **Node.js** (версии 18 или выше) и пакетный менеджер **npm**

1. Клонирование репозитория и переход в папку проекта
Откройте терминал (PowerShell, Terminal или Bash) и выполните:

```
git clone <ССЫЛКА_НА_РЕПОЗИТОРИЙ>
cd lab-sqlite-express
```
2. Установка зависимостей
Установите пакеты проекта (express, better-sqlite3 и остальные зависимости из package.json):

```
npm install
```
3. Запуск сервера
По умолчанию приложение запускается на порту 3000 (или на порту из переменной окружения PORT).
Запуск на порту по умолчанию (3000):

```
node src/app.js
```
При первом запуске модуль src/db.js автоматически создаст файл базы данных tasks.db в корне проекта и инициализирует таблицу tasks.

## API эндпоинты
Базовый URL : http://localhost:3000/api/tasks.

# 1. Получить список задач — GET /api/tasks

Возвращает массив всех задач, отсортированных по дате создания в обратном порядке ( `ORDER BY created_at DESC, id DESC` — сначала новые).

- Статус ответа: `200 OK`
- Пример ответа:

```
[
  {
    "id": 2,
    "title": "Проверить PUT и DELETE",
    "description": null,
    "completed": 0,
    "created_at": "2026-11-24 16:05:00"
  },
  {
    "id": 1,
    "title": "Настроить Express и SQLite",
    "description": "Создать таблицу tasks и CRUD",
    "completed": 1,
    "created_at": "2026-11-24 16:00:00"
  }
]
```
# 2. Создать задачу — `POST /api/tasks`

Создаёт новую задачу в таблице `tasks`.

- Тело запроса (JSON):

- `title` (`string`, обязательно) — непустая строка после `trim()`.

- `description` (`string | null`, необязательно).

- Статус при успехе: `201 Created` (возвращает созданную задачу из БД).

- Статус при ошибке: `400 Bad Request`, если `title` отсутствует, не является строкой или состоит только из пробелов.

# 3. Обновить задачу — `PUT /api/tasks/:id`

Обновляет существующую задачу по числовому `id`. Изменяются только поля  `title, description и completed`; поле `created_at` остаётся неизменным даже если передать его в теле запроса.

- Тело запроса (JSON): любые из полей `title, description, completed` (`boolean` или `0 / 1`). Если `title` передан, он не должен быть пустым.
- Статус при успехе: `200 OK` (возвращает обновлённую задачу из БД).

- Статусы при ошибках:

- `400 Bad Request` — передан пустой `title` или некорректный тип `completed`.
- `404 Not Found` — некорректный `id` или задача с таким `id` не найдена.

# 4. Удалить задачу — `DELETE /api/tasks/:id`

Удаляет задачу по `id`.

- Статус при успехе: `200 OK`
- Статус при ошибке: `404 Not Found` — некорректный `id` или задача с таким `id` не найдена.

## Проверка запросов в PowerShell
Пока сервер запущен в одном терминале, откройте второй терминал PowerShell в папке проекта и выполните проверки:
# 1. Создание задачи (ожидается 201)
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/tasks" -ContentType "application/json" -Body '{"title":"Первая задача","description":"Проверка POST"}'

# 2. Пустой title (ожидается 400)
try { Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/tasks" -ContentType "application/json" -Body '{"title":"   "}' } catch { $_.Exception.Response.StatusCode.value__;$_.ErrorDetails.Message }

# 3. Получение списка задач (ожидается 200, сортировка created_at DESC)
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/tasks"

# 4. Обновление задачи; created_at не меняется (ожидается 200)
Invoke-RestMethod -Method Put -Uri "http://localhost:3000/api/tasks/1" -ContentType "application/json" -Body '{"title":"Обновлённая задача","completed":true,"created_at":"1999-01-01 00:00:00"}'

# 5. Несуществующий ID (ожидается 404)
try { Invoke-RestMethod -Method Put -Uri "http://localhost:3000/api/tasks/99999" -ContentType "application/json" -Body '{"title":"Тест"}' } catch { $_.Exception.Response.StatusCode.value__ }
try { Invoke-RestMethod -Method Delete -Uri "http://localhost:3000/api/tasks/99999" } catch { $_.Exception.Response.StatusCode.value__ }

# 6. Удаление задачи (ожидается 200)
Invoke-RestMethod -Method Delete -Uri "http://localhost:3000/api/tasks/1"

## Остановка и сброс базы данных
- Остановка сервера: нажмите Ctrl + C в терминале, где запущен node src/app.js.
- Сброс базы: остановите сервер и удалите файл tasks.db — при следующем запуске таблица tasks создастся заново пустой.
