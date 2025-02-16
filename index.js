const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

// Middleware to parse URL-encoded data (form data)
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to parse JSON
app.use(bodyParser.json());

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});

// Test the database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
  connection.release();
});

// Serve static files (e.g., your HTML form)
app.use(express.static('public'));

// Define a POST route to handle form submissions
app.post('/submit-form', (req, res) => {
  const { name, email } = req.body;

  // Insert form data into the database
  const query = 'INSERT INTO users (name, email) VALUES (?, ?)';
  pool.query(query, [name, email], (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('An error occurred while processing your request.');
      return;
    }
    res.send('Form submitted successfully!');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
