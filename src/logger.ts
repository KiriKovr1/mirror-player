import log4js from 'log4js';
import path from 'path';
import { loggerConfig } from './config';
import { namespace } from './namespace';

const {
    logsDir,
    logsDaysKeep,
    logsDelayedError,
} = loggerConfig;

log4js.configure({
    appenders: {
        console: {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: '%r %x{ident} %[%c.%p%] %m',
                tokens: {
                    ident: () => `=${namespace.get('ident') || '*'}=`,
                },
            },
        },
        server: {
            type: 'log4js-safe-rotate-appender',
            filename: path.join(__dirname, logsDir, 'server.log'),
            ...logsDaysKeep ? {
                daysToKeep: logsDaysKeep,
            } : {},
            layout: {
                type: 'pattern',
                pattern: '%d %x{ident} %p %m',
                tokens: {
                    ident: () => `=${namespace.get('ident') || '*'}=`,
                },
            },
        },
        bot: {
            type: 'log4js-safe-rotate-appender',
            filename: path.join(__dirname, logsDir, 'bot.log'),
            ...logsDaysKeep ? {
                daysToKeep: logsDaysKeep,
            } : {},
            layout: {
                type: 'pattern',
                pattern: '%d %x{ident} %p %m',
                tokens: {
                    ident: () => `=${namespace.get('ident') || '*'}=`,
                },
            },
        },
        client: {
            type: 'log4js-safe-rotate-appender',
            filename: path.join(__dirname, logsDir, 'client.log'),
            ...logsDaysKeep ? {
                daysToKeep: logsDaysKeep,
            } : {},
            layout: {
                type: 'pattern',
                pattern: '%d %x{ident} %p %m',
                tokens: {
                    ident: () => `=${namespace.get('ident') || '*'}=`,
                },
            },
        },
    },
    categories: {
        default: {
            appenders: ['console'],
            level: 'trace',
        },
        server: process.pid === 1 ? {
            appenders: ['server'],
            level: 'trace',
        } : {
            appenders: ['console', 'server'],
            level: 'trace',
        },
        bot: process.pid === 1 ? {
            appenders: ['bot'],
            level: 'trace',
        } : {
            appenders: ['console', 'bot'],
            level: 'trace',
        },
        client: process.pid === 1 ? {
            appenders: ['client'],
            level: 'trace',
        } : {
            appenders: ['console', 'client'],
            level: 'trace',
        },
    },
});

const serverLogger = log4js.getLogger('server');
console.error = serverLogger.error.bind(serverLogger);
console.warn = serverLogger.warn.bind(serverLogger);
console.log = serverLogger.info.bind(serverLogger);
console.debug = serverLogger.debug.bind(serverLogger);
console.trace = serverLogger.trace.bind(serverLogger);

const botLogger = log4js.getLogger('bot');
const clientLogger = log4js.getLogger('client');
const clientLoggerMiddleware = log4js.connectLogger(clientLogger, { level: 'auto' });

if (logsDelayedError) {
    serverLogger.error(logsDelayedError);
}

export {
    serverLogger,
    botLogger,
    clientLogger,
    clientLoggerMiddleware,
};
