import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",

  transport:
    process.env.NODE_ENV !== "production"
      ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
      : undefined,

  base: {
    env: process.env.NODE_ENV || "development",
  },

  redact: {
    paths: ['password', 'token', 'headers.authorization'],
    remove: true,
  },

  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },

  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
