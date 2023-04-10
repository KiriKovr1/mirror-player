import merge from 'deepmerge';
import path from 'path';
import fs from 'fs';
import configDefault from './config.default';

export type ServerConfig = {
    host: string,
    port: number,
}

export type LoggerConfig = {
    logsDir: string,
    logsDaysKeep: number,
    logsDaysHistory: number,
    logsDelayedError: string | null,
}

export type BasicAuthConfig = {
    users: {
        [key: string]: string,
    },
}

export type Config = {
    server: ServerConfig,
    pensionServer: ServerConfig,
    logger: LoggerConfig,
}

const configLocal: object = {};
try {
    Object.assign(
        configLocal,
        JSON.parse(fs.readFileSync(process.env.FAQ_SERVICE_DAEMON_CONFIG || path.resolve(__dirname, '../../config-local.json')).toString('utf8')),
    );
} catch (error) {
    Object.assign(configLocal, { logger: { logsDelayedError: `Local config error: ${error}` } });
}
const config: Config = merge(configDefault, configLocal);

export const serverConfig: ServerConfig = config.server;
export const pensionServerConfig: ServerConfig = config.pensionServer;
export const loggerConfig: LoggerConfig = config.logger;
