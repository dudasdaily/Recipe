// server/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const ingredientRouter = require('./routes/ingredient');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/ingredient', ingredientRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
