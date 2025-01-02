function getLoggerConfig() {
    if (process.env.NODE_ENV === 'production') {
      return true; // Use default logger in production
    }
    return {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    };
  }
  
  module.exports = getLoggerConfig;