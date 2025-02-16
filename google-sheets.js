const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

// Google Sheets Setup
const auth = new google.auth.GoogleAuth({
  keyFile: 'google-credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function saveToGoogleSheets(name, email) {
  try {
    const spreadsheetId = '1YNH8dZ7Fj1yNcjEs9-yAripLpq7QYIRpgtW7RUns2pk';
    const range = 'Sheet1!A:B';

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[name, email]],
      },
    });

    console.log('Data successfully saved to Google Sheets.');
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
  }
}

module.exports = saveToGoogleSheets;
