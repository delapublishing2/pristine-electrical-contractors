const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the "public" directory
app.use(express.static('public')); // Serve static files from the "public" directory

// Define a route for the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

app.get('/style.css', function(req, res) {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(__dirname + '/style.css');
  });
  
  app.get('/script.js', function(req, res) {
    res.setHeader('Content-Type', 'text/javascript');
    res.sendFile(__dirname + '/script.js');
  });

  