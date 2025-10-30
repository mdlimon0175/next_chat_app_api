// logger.js
const { join } = require("path");
const { existsSync, mkdirSync } = require("fs");
const { createLogger, format, transports } = require("winston");
const { isProduction } = require("./config/app");

/**
* @note for vercel we use tmp directory. it will be join(__dirname, 'storage', 'logs');
*/
const logDir = isProduction ? join('/tmp', 'logs') : join(__dirname, 'storage', 'logs');

if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
}

const customFormat = format.printf(({ timestamp, level, message, stack, metadata }) => {
    const meta = Object.keys(metadata).length ? JSON.stringify(metadata, null, 2) : '';
    return `${timestamp} ${level.toUpperCase()}: ${stack || message}${meta ? `\nMetadata: ${meta}` : ''}`;
});

const logger = createLogger({
    level: "error",
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.errors({ stack: true }),
        format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'stack'] }),
        customFormat
    ),
    transports: [
        new transports.File({ filename: join(logDir, "app.log") }),
        // new transports.Console({
        //     level: "error",
        //     format: format.combine(
        //         format.colorize(),
        //         format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        //         format.errors({ stack: true }),
        //         format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'stack'] }),
        //         customFormat
        //     ),
        // }),
    ],
});

module.exports = logger;
