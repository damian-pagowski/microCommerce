let loggerInstance;

const setLogger = (fastifyInstance) => {
  loggerInstance = fastifyInstance.log;
};

const getLogger = () => {
  if (!loggerInstance) {
    return console;
  }
  return loggerInstance;
};

module.exports = { setLogger, getLogger };