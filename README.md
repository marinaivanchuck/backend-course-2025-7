# Inventory Service (Lab 6)

## Коротко
Сервіс інвентаризації — REST API для додавання, пошуку, оновлення і 
видалення предметів з можливістю завантаження фото.

## Файли в репозиторії
- index.js — головний файл програми.
- package.json, package-lock.json
- RegisterForm.html, SearchForm.html — HTML форми.
- postman_collection.json — експортована колекція Postman.
- Dockerfile, docker-compose.yml — для запуску у контейнері.
- cache/ — директорія із кешованими файлами (не додається до репо).

## Вимоги для запуску (локально)
- Node.js 18+ (рекомендовано 20+)
- npm
- Postman (для тестування)

## Як запускати локально

### 1. Встановити залежності:
npm install

### 2. Запуск у режимі розробки:
npm run dev -- -h 127.0.0.1 -p 3000 -c ./cache

### 3. Звичайний запуск:
node index.js -h 127.0.0.1 -p 3000 -c ./cache

### 4. Відкрити у браузері:

http://127.0.0.1:3000/RegisterForm.html  
http://127.0.0.1:3000/SearchForm.html  
http://127.0.0.1:3000/docs  

## Docker

### 1. Побудувати образ:
docker build -t inventory-service .

### 2. Запустити:
docker run -p 3000:3000 inventory-service

## Postman
Імпортуйте файл postman_collection.json у Postman і використовуйте змінні 
host, port, id.

