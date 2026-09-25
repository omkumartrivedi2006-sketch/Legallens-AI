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

import { productionErrorHandler } from './middleware/errorHandler';

// Security Headers Middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

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

// Serve static frontend in production
const distPath = path.join(rootDir, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for client-side routing (excluding /api)
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      next(err);
    }
  });
});

// Global Production Error Handler with Safe Reference IDs
app.use(productionErrorHandler);

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[LegalLens AI] Server running on http://0.0.0.0:${PORT}`);
  console.log(`[LegalLens AI] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[LegalLens AI] GenAI model: ${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`);
  console.log(`[LegalLens AI] API key configured: ${Boolean(process.env.GEMINI_API_KEY)}`);
});

// Keep process alive in background subshells
setInterval(() => {}, 1000 * 60 * 60);

export { app, server };

