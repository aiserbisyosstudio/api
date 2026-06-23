import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
const combinedDir = path.join(logsDir, 'combined');
const errorDir = path.join(logsDir, 'error');

[logsDir, combinedDir, errorDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const { combine, timestamp, printf, errors, json, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}] : ${stack || message}`;
});

const logger = winston.createLogger({
  level: 'info',

  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    errors({ stack: true }),
    json(),
  ),

  transports: [
    new DailyRotateFile({
      filename: `${logsDir}/combined/%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),

    new DailyRotateFile({
      level: 'error',
      filename: `${logsDir}/error/%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],

  exceptionHandlers: [
    new DailyRotateFile({
      filename: `${logsDir}/error/exceptions-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
    }),
  ],

  rejectionHandlers: [
    new DailyRotateFile({
      filename: `${logsDir}/error/rejections-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        logFormat,
      ),
    }),
  );
}

export default logger;