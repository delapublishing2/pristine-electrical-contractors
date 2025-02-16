const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
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

      // Prepare the email content
      const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to: email, // Recipient address (the form submitter)
        subject: 'Form Submission Confirmation',
        text: `
          Dear ${firstName} ${lastName},

          Thank you for your submission. Someone will be with you shortly. 
          Here is a summary of your submission:

          Name: ${firstName} ${lastName}
          Phone: ${phone || 'Not provided'}
          Email: ${email}
          Address: ${address || 'Not provided'}
          Are you a new customer? ${newCustomer || 'Not specified'}
          How can we help you? ${helpDescription || 'No description provided'}

          Best regards,
          Pristine Electrical Contractors
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
