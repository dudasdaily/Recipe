// server/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const ingredientRouter = require('./routes/ingredient'); //이미지 업로드 API
const ingredientsRouter = require('./routes/ingredients'); // DB table 연결 API


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/ingredient', ingredientRouter);  // POST /api/ingredient/upload
app.use('/api/ingredients', ingredientsRouter); // GET, POST /api/ingredients

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
