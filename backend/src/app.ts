import express, { Express } from 'express';
import cors from 'cors';
import { errorMiddleware } from './middlewares/error.middleware';
import { categoryRouter } from './modules/categories/category.routes';
import { supplierRouter } from './modules/suppliers/supplier.routes';

export const app: Express = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.use('/categories', categoryRouter);
app.use('/suppliers', supplierRouter);

app.use(errorMiddleware);
