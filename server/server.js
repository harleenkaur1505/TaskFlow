const http = require('http');
const dotenv = require('dotenv');

// Load env vars before anything else
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO on the HTTP server
initSocket(server);

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
