import express from 'express';
import pino from 'pino-http';
import cors from 'cors';

import { env } from './utils/env.js';

import router from './routers/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';

const PORT = Number(env('PORT', '3000'));

export const startServer = () => {
  const app = express();

  // Middleware для JSON парсингу та CORS
  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());

  // Підключення логгера pino як middleware
  app.use(
    pino({
      transport: {
        target: 'pino-pretty', // Для гарного виведення логів
      },
    }),
  );

  app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the Contacts API!' });
  });

  app.use(router);

  app.use('*', notFoundHandler);

  app.use(errorHandler);

  // Запуск сервера
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
