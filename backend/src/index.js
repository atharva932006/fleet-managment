const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db');
const { router: authRouter } = require('./routes/auth');
const ownerRouter = require('./routes/owner');
const driverRouter = require('./routes/driver');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Receipts
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/owner', ownerRouter);
app.use('/api/driver', driverRouter);

// Basic Health Check Endpoint
app.use('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Fleet Management System API is running.' });
});

// Serve frontend in production (optional fallback, but dev servers will run on different ports)
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something broke on the server!' });
});

// Database and Server Start
async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database or start server:', error);
    process.exit(1);
  }
}

startServer();
