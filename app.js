require('dotenv').config();
const express = require('express');
const app = express();
const usersRouter = require('./routes/users');

app.use(express.json());

app.get('/', (req, res) => {
  res.send({ ok: true, message: 'Server is running' });
});

app.use('/users', usersRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
