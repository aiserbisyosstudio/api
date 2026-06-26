import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from './config/logger.js';
import { requestLogger } from './middlewares/requestLogger.js';

const app = express();

app.use(helmet());
app.use(morgan('dev'));

const allowedOrigins = [
  'https://www.aiserbisyosstudio.com',
  'https://aiserbisyosstudio.com',
  'http://localhost:5173',
];
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import contactRouter from "./routes/contact.route.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/contact", contactRouter);

app.get('/', (req, res) => {
  logger.info('Home route accessed');
  res.json({
    success: true,
    message: 'Welcome to AI Serbisyos Studio api service...',
  });
});

app.get('/error', (req, res) => {
  try {
    throw new Error('Sample Error');
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
});

export default app;