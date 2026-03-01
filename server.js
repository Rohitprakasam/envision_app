const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the React app dist
app.use(express.static(path.join(__dirname, 'frontend/aura-care-connect/dist')));

// Correct path for any request to index.html (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/aura-care-connect/dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
