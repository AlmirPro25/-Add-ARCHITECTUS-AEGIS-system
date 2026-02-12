
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import apiRoutes from './routes/api.routes';
import { Logger } from './utils/logger';

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for some Vite/React dev setups, refine for production
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://*.tile.openstreetmap.org", "https://*.openstreetmap.org"], // For Leaflet tiles
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "ws:", "wss:", "http://localhost:*"], // Allow WebSocket connections
      mediaSrc: ["'self'", "blob:"],
      frameSrc: ["'self'"],
    },
  },
}));

// CORS configuration (adjust for production)
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*', // Lock this to the dashboard domain in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  Logger.info(`Created uploads directory at ${uploadsDir}`);
}

// Static Files (Frontend build & Uploads)
// In a production Docker setup, Nginx would serve frontend static files.
// For dev/local, we serve the frontend build from here.
app.use(express.static(path.join(__dirname, '../../frontend/dist'))); // Serving compiled frontend files
app.use('/uploads', express.static(uploadsDir)); // Serving uploaded media files

// API Routes
app.use('/api/v1', apiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch-all for SPA routing (important for React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

export default app;
