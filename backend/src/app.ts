import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middlewares/error.middleware';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.use(errorMiddleware);
