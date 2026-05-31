import express from 'express';
import cors from 'cors';
import path from 'path';
import { existsSync } from 'fs';
import candidatesRouter from './routes/candidates';
import votesRouter from './routes/votes';
import adminRouter from './routes/admin';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/candidates', candidatesRouter);
app.use('/api/votes', votesRouter);
app.use('/api/admin', adminRouter);

// Serve compiled frontend in production
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
if (existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Admin password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
});
