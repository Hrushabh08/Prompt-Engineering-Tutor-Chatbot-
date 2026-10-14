import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config.js';
import { apiRouter } from './routes/api.js';

const app = express();

// Security and middleware
app.use(cors({
  origin: true, // Allow frontend during development and local network
  credentials: true
}));

app.use(express.json({ limit: '5mb' }));

// Request logging (sanitized, no sensitive payloads)
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// API Routes
app.use('/api', apiRouter);

// Root greeting / status
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'PromptCraft AI Backend Service',
    version: '1.0.0',
    description: 'Intelligent Prompt Engineering Tutor API',
    endpoints: [
      'GET /api/health',
      'POST /api/chat',
      'POST /api/improve-prompt',
      'POST /api/generate-prompt',
      'POST /api/evaluate-answer'
    ]
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err.message || err);
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An internal server error occurred.'
  });
});

app.listen(config.port, () => {
  console.log(`=========================================`);
  console.log(`PromptCraft AI Server listening on port ${config.port}`);
  console.log(`AI Provider: ${config.aiProvider.toUpperCase()}`);
  console.log(`AI Model: ${config.aiModel}`);
  console.log(`API Key Configured: ${config.isConfigured ? 'YES (Live AI Active)' : 'NO (Setup Required in .env)'}`);
  console.log(`=========================================`);
});
