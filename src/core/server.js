const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Unique name generator

const app = express();
const PORT = 8000;

app.use(cors());

// Set up storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../assets/img/recycleHub')); // Save to Angular project
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`; // Generate a unique filename
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

app.post('/upload', upload.single('profilePhoto'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({ filePath: `assets/img/recycleHub/${req.file.filename}` }); // Return file path
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


// node src/core/server.js
// json-server --watch src/core/db.json --port 3001
