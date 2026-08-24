type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    // In a real application, this might send to an external logging service (e.g. Datadog, Sentry)
    // Avoid logging sensitive data (like plaintext OTPs)
    if (process.env.NODE_ENV !== 'production' || level === 'error') {
      console[level](JSON.stringify(entry));
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, error?: any) {
    // Check if error is an Error object to extract stack trace
    const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : error;
    this.log('error', message, errorData);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }
}

export const logger = new Logger();
