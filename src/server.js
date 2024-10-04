import express from 'express';
import pino from 'pino-http';
import cors from 'cors';

import { env } from './utils/env.js';

import router from './routers/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import { UPLOAD_DIR } from './constants/index.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';

const PORT = Number(env('PORT', '3000'));

export const startServer = () => {
  const app = express();

  // Middleware для JSON парсингу та CORS
  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());
  app.use('/uploads', express.static(UPLOAD_DIR));
  app.use('/api-docs', swaggerDocs());

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
