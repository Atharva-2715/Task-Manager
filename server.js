const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const taskRoutes = require('./routes/taskRoutes');
const logRoutes = require('./routes/logRoutes');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task_manager_dashboard';

// Global middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Handle invalid JSON payloads gracefully
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload.' });
  }
  return next(err);
});

// Protect API routes with Auth
app.use('/api', authMiddleware);

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/tasks', taskRoutes);
app.use('/api/logs', logRoutes);

// Unknown API route handler
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Resource not found.' });
});

app.use(errorHandler);

// Connect to MongoDB and start server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      
      console.log(`Task Manager Dashboard running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

