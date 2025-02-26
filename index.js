const dotenv = require('dotenv');
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const saveToGoogleSheets = require('./google-sheets');
const nodemailer = require('nodemailer'); // <-- Add this line

dotenv.config();

// Create a Nodemailer transporter using your email service's SMTP settings
const transporter = nodemailer.createTransport({
  service: 'gmail', // Replace with your email service (e.g., 'gmail', 'yahoo', etc.)
  auth: {
    user: process.env.EMAIL_USER, // Your email address from .env
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

const app = express();
const port = 3306;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('docs'));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 3306,
  connectTimeout: 50000, // Increase timeout (10 seconds)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
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


      // Prepare the email content
      const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to: email, // Recipient address (the form submitter)
        subject: 'Form Submission Confirmation',
        html: `
          <html>
            <body>
              <h1 style="color: #4CAF50;">Form Submission Confirmation</h1>
              <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
              <p>Thank you for your submission. Someone will be with you shortly.</p>
              
              <h2>Here is a summary of your submission:</h2>
              
              <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Name</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${firstName} ${lastName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Phone</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${phone || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Address</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${address || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Are you a new customer?</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${newCustomer || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">How can we help you?</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${helpDescription || 'No description provided'}</td>
                </tr>
              </table>
              
              <br>
              <p>Best regards,<br>Pristine Electrical Contractors</p>
            </body>
          </html>
        `,
      };

      // Send the email
      try {
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent successfully.');
      } catch (emailErr) {
        console.error('Error sending confirmation email:', emailErr);
      }

      // Save form data to Google Sheets
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
