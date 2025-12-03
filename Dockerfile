FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm install --no-save nodemon

EXPOSE 3000 9229

CMD ["npx", "nodemon", "--inspect=0.0.0.0:9229", "--watch", "src", "src/app.js"]
