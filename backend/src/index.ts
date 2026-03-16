import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { mockupsRouter } from './routes/mockups';

dotenv.config({ path: '../.env' });

const app = express();
const port = Number(process.env.PORT ?? 8787);
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

app.use(
  cors({
    origin: corsOrigin,
  }),
);
app.use(express.json({ limit: '15mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', mockupsRouter);

app.listen(port, () => {
  // Keep logs short and explicit for local troubleshooting.
  console.log(`Mockup backend listening on http://localhost:${port}`);
  console.log(`GEMINI_API_KEY configured: ${process.env.GEMINI_API_KEY ? 'yes' : 'no'}`);
});
