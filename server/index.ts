import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { aiRouter } from './routes/aiRoutes';

// Load environment variables (.env.local takes precedence over .env)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));

// Mount API routes
app.use('/api', aiRouter);

// Global Error Handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Server error:', err);
    res.status(500).json({
      error: 'Internal server error occurred in LegalLens AI backend.',
    });
  }
);

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[LegalLens AI] Server running on http://127.0.0.1:${PORT}`);
  console.log(`[LegalLens AI] GenAI model: ${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`);
  console.log(`[LegalLens AI] API key configured: ${Boolean(process.env.GEMINI_API_KEY)}`);
});

// Keep process alive in background subshells
setInterval(() => {}, 1000 * 60 * 60);

export { app, server };

