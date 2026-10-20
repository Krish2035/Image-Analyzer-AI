import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import chatRoutes from './routes/chat.routes.js';

const app = express();

// Middleware
app.use(cors());
// Increased limit to 25mb for high-resolution base64 screenshots
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Mount API routes
app.use('/api', chatRoutes);

// Root test route
app.get('/', (req, res) => {
  res.json({
    name: 'Image Analyzer AI Backend',
    version: '1.0.0',
    description: 'ChatGPT-style multimodal AI assistant with Gemini 1.5 Flash and Groq Vision failover',
  });
});

// Start listening
const server = app.listen(config.port, () => {
  logger.success(`Server running on port ${config.port} [NODE_ENV=${config.nodeEnv}]`);
  logger.info(`Health check available at http://localhost:${config.port}/api/health`);
  logger.info(`Gemini configured: ${Boolean(config.geminiApiKey)} | Groq configured: ${Boolean(config.groqApiKey)}`);
});

server.on('error', (err) => {
  logger.error('Server failed to start:', err.message);
});
