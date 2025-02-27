const mysql = require('mysql2');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  const { firstName, lastName, phone, email, address, newCustomer, helpDescription } = JSON.parse(event.body);

  // Database Connection
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
  });

  try {
    // Insert into MySQL
    const query = 'INSERT INTO users (firstName, lastName, phone, email, address, newCustomer, helpDescription) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await connection.promise().query(query, [firstName, lastName, phone, email, address, newCustomer, helpDescription]);

    // Save to Google Sheets
    const auth = new google.auth.GoogleAuth({
      keyFile: 'google-credentials.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[firstName, lastName, phone, email, address, newCustomer, helpDescription]] },
    });

    // Send Email Confirmation
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Form Submission Confirmation',
      html: `<p>Dear ${firstName} ${lastName},<br>Your submission was successful!</p>`,
    });

    return { statusCode: 200, body: JSON.stringify({ message: 'Form submitted successfully!' }) };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Server Error' }) };
  } finally {
    connection.end();
  }
};
