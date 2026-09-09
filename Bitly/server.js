require("dotenv").config();

const express = require('express');
const app = express();
const urlRoutes = require('./routes/urlRoutes');

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: "URL Shortener API running" });
});

app.use(urlRoutes);

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;