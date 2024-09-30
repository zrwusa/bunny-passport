import { Logger, LoggerService } from "@nestjs/common";
import * as winston from "winston";
import { WinstonModule } from "nest-winston";

// Define your winston formats and transports
const appFileLog = new winston.transports.File({
  filename: 'logs/app.log',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
});

const errorFileLog = new winston.transports.File({
  filename: 'logs/error.log',
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
});

const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple(),
);

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
);

const isProduction = process.env.NODE_ENV === 'production';
const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: isProduction ? prodFormat : devFormat,
    }),
    ...(isProduction ? [appFileLog, errorFileLog] : []),
  ],
});

// Logger Service
export class BunnyLogger implements LoggerService {
  private readonly isProduction = process.env.NODE_ENV === 'production';
  private readonly logger = new Logger();

  log(message: string) {
    if (this.isProduction) {
      logger.log(message);
    } else {
      this.logger.log(message);
    }
  }

  error(message: string, trace: string) {
    if (this.isProduction) {
      logger.error(message, { trace });
    } else {
      this.logger.error(message, trace);
    }
  }

  warn(message: string) {
    if (this.isProduction) {
      logger.warn(message);
    } else {
      this.logger.warn(message);
    }
  }

  debug(message: string) {
    if (this.isProduction) {
      logger.debug(message);
    } else {
      this.logger.debug(message);
    }
  }

  verbose(message: string) {
    if (this.isProduction) {
      logger.verbose(message);
    } else {
      this.logger.log(message);
    }
  }
}
