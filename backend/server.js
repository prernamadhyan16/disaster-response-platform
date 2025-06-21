require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const disasterRoutes = require('./routes/disasters');
const geocodingRoutes = require('./routes/geocoding');
const socialMediaRoutes = require('./routes/socialMedia');
const resourceRoutes = require('./routes/resources');
const updateRoutes = require('./routes/updates');
const verificationRoutes = require('./routes/verification');
const { setupScheduledTasks } = require('./utils/scheduler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Socket.io middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/disasters', disasterRoutes);
app.use('/api/geocoding', geocodingRoutes);
app.use('/api/social-media', socialMediaRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/verification', verificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('join_disaster', (disasterId) => {
    socket.join(`disaster_${disasterId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Setup scheduled tasks
setupScheduledTasks();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
