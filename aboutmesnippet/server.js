const express = require('express');
const app = express();
const path = require('path');

// Serve all static files in the current directory
app.use(express.static(__dirname));

// Catch-all to serve index.html if someone goes to /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
