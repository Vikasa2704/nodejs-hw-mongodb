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
  app.get('/contacts', async (req, res, next) => {
    const contacts = await getAllContacts();
    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  });

  // Роут для отримання контакту за ID
  app.get('/contacts/:contactId', async (req, res, next) => {
    try {
      const { contactId } = req.params;
      const contact = await getContactById(contactId);

      // Відповідь, якщо контакт не знайдено
      if (!contact) {
        return res.status(404).json({
          message: 'Contact not found',
        });
      }

      // Відповідь, якщо контакт знайдено
      res.status(200).json({
        status: 200,
        message: `Successfully found contact with id ${contactId}!`,
        data: contact,
      });
    } catch (err) {
      next(err); // Передача помилки в middleware для обробки помилок
    }
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
