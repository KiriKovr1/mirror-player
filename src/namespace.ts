/* eslint-disable no-underscore-dangle */
import crypto from 'crypto';
import { createNamespace } from 'cls-hooked';
import { Request, Response, NextFunction } from 'express';

const namespace = createNamespace('superkassa');

const namespaceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const cryptoString: string = (await new Promise((resolve, reject) => {
        crypto.randomBytes(8, (error, result: Buffer) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    })).toString('hex');
    const {
        ident = cryptoString,
    } = req.query || {};
    namespace.bindEmitter(req);
    namespace.bindEmitter(res);
    namespace.run(() => {
        namespace.set('ident', ident);
        namespace.set('relax', false);
        res.once('finish', () => {
            namespace.set('relax', true);
        });
        next();
    });
};

const namespaceClose = async (max = 9000, step = 100) => {
    const deadline = Date.now() + max;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const nameSpaceValues: Array<{ ident: string, relax: boolean }> = Array
            // @ts-ignore
            .from(namespace._contexts.values());
        const busy = Array.from(new Set(nameSpaceValues
            .flatMap(({ ident, relax }: {
                ident: string,
                relax: boolean,
            }) => (relax ? [] : [ident]))));
        if (!busy.length) {
            return null;
        }
        const rem = deadline - Date.now();
        if (rem <= 0) {
            return busy;
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, Math.min(rem, step)));
    }
};

export {
    namespace,
    namespaceMiddleware,
    namespaceClose,
};
