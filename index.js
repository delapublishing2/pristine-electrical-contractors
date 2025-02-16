const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const saveToGoogleSheets = require('./google-sheets');

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});

app.post('/submit-form', async (req, res) => {
  const { name, email } = req.body;

  // Insert into MySQL
  const query = 'INSERT INTO users (name, email) VALUES (?, ?)';
  pool.query(query, [name, email], async (err, results) => {
    if (err) {
      console.error('Error inserting into MySQL:', err);
      return res.status(500).send('An error occurred.');
    }

    // Insert into Google Sheets
    await saveToGoogleSheets(name, email);
    res.send('Form submitted successfully!');
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
