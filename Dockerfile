# Dockerfile

FROM node:18-alpine

# Створюємо робочу директорію
WORKDIR /usr/src/app

# Копіюємо package.json та package-lock.json
COPY package*.json ./

# Встановлюємо ВСІ залежності (включаючи production і development)
RUN npm ci

# Встановлюємо nodemon глобально
RUN npm install -g nodemon

# Копіюємо решту файлів (включно з src/ та .env.sample)
COPY . .

# Визначаємо, який порт використовує контейнер
EXPOSE 3000

# Команда запуску за замовчуванням 
CMD ["node", "src/app.js"]