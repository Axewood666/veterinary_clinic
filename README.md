# Ветеринарная клиника

Система управления ветеринарной клиникой с админ-панелью.

## Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd veterinary-clinic
```

2. Установите зависимости для бэкенда:
```bash
cd backend
npm install
```

3. Установите зависимости для фронтенда:
```bash
cd ../frontend
npm install
```

## Настройка

### Бэкенд

Создайте файл `.env` в директории `backend` со следующими переменными:
```
NODE_ENV=development
PORT=4000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=veterinary_clinic
JWT_SECRET=your-jwt-secret-key
```

### Фронтенд

Создайте файл `.env` в директории `frontend` со следующими переменными:
```
NODE_ENV=development
PORT=3000
BACKEND_URL=http://localhost:4000
SESSION_SECRET=your-session-secret-key
JWT_SECRET=your-jwt-secret-key
```

## Запуск

1. Запустите бэкенд:
```bash
cd backend
npm run dev
```

2. Запустите фронтенд:
```bash
cd frontend
npm run dev
```

## Функциональность

### Админ-панель
- Управление ветеринарами
- Управление клиентами
- Управление питомцами
- Управление приемами
- Настройки системы
- Статистика и аналитика

### Ветеринары
- Просмотр расписания
- Управление приемами
- История пациентов
- Медицинские записи

### Клиенты
- Запись на прием
- История посещений
- Управление питомцами
- Просмотр медицинских записей

## Технологии

### Бэкенд
- Node.js
- Express
- Knex.js
- PostgreSQL
- JWT Authentication

### Фронтенд
- Node.js
- Express
- Pug
- CSS3
- JavaScript (ES6+)