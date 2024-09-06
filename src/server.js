import express from 'express';
import pinoHttp from 'pino-http';
import cors from 'cors';

import { env } from './utils/env.js';
import { getAllContacts, getContactById } from './services/contacts.js';

const PORT = Number(env('PORT', '3000'));

export const startServer = () => {
  const app = express();

  // Middleware для JSON парсингу та CORS
  app.use(express.json());
  app.use(cors());

  // Підключення логгера pino як middleware
  app.use(
    pinoHttp({
      transport: {
        target: 'pino-pretty', // Для гарного виведення логів
      },
    }),
  );

  // Роут для отримання всіх контактів
  app.get('/contacts', async (req, res) => {
    const contacts = await getAllContacts();
    res.status(200).json({
      data: contacts,
    });
  });

  // Роут для отримання контакту за ID
  app.get('/contacts/:contactId', async (req, res, next) => {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);

    if (!contact) {
      return res.status(404).json({
        message: 'Contact not found',
      });
    }

    res.status(200).json({
      data: contact,
    });
  });

  // Роут для невідомих маршрутів
  app.use('*', (req, res, next) => {
    res.status(404).json({
      message: 'Not found',
    });
  });

  // Middleware для обробки помилок
  app.use((err, req, res, next) => {
    req.log.error(err); // Логування помилки за допомогою pino
    res.status(500).json({
      message: 'Something went wrong',
      error: err.message,
    });
  });

  // Запуск сервера
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
