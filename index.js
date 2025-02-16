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
  const {
    firstName = null,
    lastName = null,
    phone = null,
    email = null,
    address = null,
    newCustomer = null,
    helpDescription = null,
  } = req.body;

  const query = `
    INSERT INTO users (firstName, lastName, phone, email, address, newCustomer, helpDescription)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  pool.query(
    query,
    [firstName, lastName, phone, email, address, newCustomer, helpDescription],
    async (err, results) => {
      if (err) {
        console.error('Error inserting into MySQL:', err);
        return res.status(500).send('An error occurred.');
      }

      await saveToGoogleSheets({
        firstName,
        lastName,
        phone,
        email,
        address,
        newCustomer,
        helpDescription,
      });

      res.send('Form submitted successfully!');
    }
  );
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
