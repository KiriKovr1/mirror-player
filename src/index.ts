import express, { Express } from 'express';
import compression from 'compression';
import http, { Server } from 'http';
import fs from 'fs';
import path from 'path';

import ssrApp from './View/SSR';

import { AddressInfo } from 'net';
import { serverConfig } from './config';
import { serverLogger as logger, clientLoggerMiddleware } from './logger';
import { namespaceMiddleware, namespaceClose } from './namespace';

(async () => {
    try {
        logger.debug(`The server is start, pid#${process.pid}, ts#${Date.now()}`);
        process.on('exit', () => {
            logger.debug(`The server is stop, pid#${process.pid}, ts#${Date.now()}`);
        });
        const app: Express = express();
        app.enable('trust proxy');
        app.use(namespaceMiddleware);
        app.use(clientLoggerMiddleware);
        app.use(compression());
        app.use(express.json({ limit: '16mb' }));
        app.get(/\.(js|css|map|ico|woff)$/, express.static(path.resolve(process.cwd(), 'frontBuild')));
        app.get('*', (req, res) => {
            try {
                const appHTML = ssrApp(req.originalUrl);

                const indexHTML = fs.readFileSync(
                    path.join(process.cwd(), 'frontBuild/index.html'),
                    { encoding: "utf-8" }
                );

                const HTML = indexHTML.replace(
                    '<div id="root"></div>',
                    `<div id="root">${appHTML}</div>`,
                );

                res.contentType('text/html');
                res.status(200);
                res.send(HTML);
                res.end();
            } catch (err) {
                logger.error(err);
            }
        })
        logger.info(`The server is running at ${serverConfig.host}:${serverConfig.port}`);

        const server: Server = http.createServer(app);
        await new Promise((resolve, reject) => {
            server.on('error', reject);
            // @ts-ignore
            server.listen(serverConfig.port, serverConfig.host, resolve);
        });
        logger.info(`The server is listening at ${(server.address() as AddressInfo).address}:${(server.address() as AddressInfo).port}`);

        try {
            const reason = await new Promise((resolve) => {
                process.on('SIGINT', () => resolve('interrupted'));
                process.on('SIGTERM', () => resolve('terminated'));
            });
            logger.debug(`The server is ${reason}, pid#${process.pid}, ts#${Date.now()}`);
        } finally {
            server.close();
            const stall = await namespaceClose();
            if (!stall) {
                logger.info('The server is disposed successfully');
            } else {
                logger.warn(`The server is disposed unsuccessfully: ${stall.join(', ')}`);
            }
        }
    } catch (error) {
        logger.error(`Global error occured: ${error}`);
    }
})();
