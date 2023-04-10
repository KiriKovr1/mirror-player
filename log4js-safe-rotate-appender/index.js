const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
// eslint-disable-next-line
const { append: appendSafe, rename: renameSafe } = require('./build/Release/log4jsSafeRotateAppender.node');

module.exports = {
    configure: (config, layouts) => {
        const layout = config.layout
            ? layouts.layout(config.layout.type, config.layout)
            : layouts.basicLayout;

        const {
            filename,
            daysToKeep,
            timezoneOffset,
        } = config;

        // @NB(2021-08-17|vs+da): replicate logic from log4js.dateFile appender
        if (!config.alwaysIncludePattern) {
            // eslint-disable-next-line
            config.alwaysIncludePattern = false;
        }

        const suffix = () => {
            const now = new Date();
            const month = `${now.getMonth() + 1}`.padStart(2, '0');
            const day = `${now.getDate()}`.padStart(2, '0');
            const year = `${now.getFullYear()}`.padStart(4, '0');
            return `${year}-${month}-${day}`;
        };
        let currSuffix = suffix();
        let firstCommit = true;

        const foreach = (list, job, resolve) => {
            if (list.length) {
                const [head, ...tail] = list;
                job(head, () => foreach(tail, job, resolve));
            } else {
                resolve();
            }
        };

        const commit = (resolve) => {
            // // eslint-disable-next-line
            // console.debug(`log4js-safe-rotate-appender.commit: ${currSuffix}`);
            const nextSuffix = suffix();
            if (currSuffix !== nextSuffix || firstCommit) {
                currSuffix = nextSuffix;
                firstCommit = false;
                const dir = path.dirname(filename);
                const base = path.basename(filename);
                fs.readdir(dir, (readdirError, files) => {
                    if (readdirError) {
                        // eslint-disable-next-line
                        console.error(`log4js-safe-rotate-appender.readdir: ${readdirError}`);
                        resolve();
                    } else {
                        const fix = [];
                        const drop = [];
                        const compress = [];
                        files.forEach((file) => {
                            if (file.startsWith(base)) {
                                const extra = file.substr(base.length);
                                if (!extra) {
                                    fix.push(path.join(dir, file));
                                } else {
                                    const match = extra.match(/^-(\d{4}-\d{2}-\d{2})(|\.tmp|\.gz)$/);
                                    if (match) {
                                        // eslint-disable-next-line
                                        const [_line, fileSuffix, ext] = match;
                                        if (currSuffix !== fileSuffix) {
                                            const days = Math.floor(
                                                (Date.now() - new Date(fileSuffix).getTime())
                                                / (24 * 3600 * 1000),
                                            );
                                            if (daysToKeep && days > daysToKeep) {
                                                drop.push(path.join(dir, file));
                                            } else {
                                                // eslint-disable-next-line
                                                if (!ext) {
                                                    compress.push(path.join(dir, file));
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        });
                        foreach(fix, (fileUnfixed, done) => {
                            const file = `${fileUnfixed}-${currSuffix}`;
                            const fileTmp = `${file}.tmp`;
                            const fileGz = `${file}.gz`;
                            // // eslint-disable-next-line
                            // console.debug(`log4js-safe-rotate-appender.fix: ${file}`);
                            renameSafe(fileUnfixed, file, [
                                file,
                                fileTmp,
                                fileGz,
                            ], (renameError) => {
                                if (renameError) {
                                    // eslint-disable-next-line
                                    console.error(`log4js-safe-rotate-appender.fix.rename: ${renameError}`);
                                }
                                done();
                            });
                        }, () => {
                            foreach(drop, (file, done) => {
                                // // eslint-disable-next-line
                                // console.debug(`log4js-safe-rotate-appender.drop: ${file}`);
                                fs.unlink(file, (unlinkError) => {
                                    if (unlinkError) {
                                        // eslint-disable-next-line
                                        console.error(`log4js-safe-rotate-appender.drop.unlink: ${unlinkError}`);
                                    }
                                    done();
                                });
                            }, () => {
                                foreach(compress, (file, done) => {
                                    const fileTmp = `${file}.tmp`;
                                    const fileGz = `${file}.gz`;
                                    // // eslint-disable-next-line
                                    // console.debug(
                                    //     `log4js-safe-rotate-appender.compress: ${file}`,
                                    // );
                                    renameSafe(file, fileTmp, [
                                        fileTmp,
                                        fileGz,
                                    ], (renameError) => {
                                        if (renameError) {
                                            // eslint-disable-next-line
                                            console.error(`log4js-safe-rotate-appender.compress.rename: ${renameError}`);
                                            done();
                                        } else {
                                            fs.createReadStream(fileTmp)
                                                .pipe(zlib.createGzip())
                                                .pipe(fs.createWriteStream(fileGz))
                                                .on('error', (streamError) => {
                                                    // eslint-disable-next-line
                                                    console.error(`log4js-safe-rotate-appender.compress.gzip: ${streamError}`);
                                                    fs.unlink(fileGz, (unlinkError) => {
                                                        if (unlinkError) {
                                                            // eslint-disable-next-line
                                                            console.error(`log4js-safe-rotate-appender.compress.gz.unlink: ${unlinkError}`);
                                                        }
                                                        done();
                                                    });
                                                })
                                                .on('finish', () => {
                                                    fs.unlink(fileTmp, (unlinkError) => {
                                                        if (unlinkError) {
                                                            // eslint-disable-next-line
                                                            console.error(`log4js-safe-rotate-appender.compress.tmp.unlink: ${unlinkError}`);
                                                        }
                                                        done();
                                                    });
                                                });
                                        }
                                    });
                                }, () => {
                                    resolve();
                                });
                            });
                        });
                    }
                });
            } else {
                resolve();
            }
        };

        const lines = [];
        let first = true;
        const flush = (resolve) => {
            // // eslint-disable-next-line
            // console.debug(`log4js-safe-rotate-appender.flush: ${lines.length}`);
            if (lines.length) {
                const filenamePrev = `${filename}-${currSuffix}`;
                appendSafe(filenamePrev, Buffer.concat(lines.splice(0)), (error) => {
                    if (error) {
                        if (first) {
                            first = false;
                            // eslint-disable-next-line
                            console.error(`log4js-safe-rotate-appender.append: ${error} // FIRST-ONLY`);
                        }
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        };

        let timerId;
        const setup = (delay = 25) => {
            if (lines.length) {
                if (timerId === undefined) {
                    timerId = setTimeout(() => {
                        commit(() => {
                            flush(() => {
                                if (timerId !== undefined) {
                                    timerId = clearTimeout(timerId);
                                }
                                setup();
                            });
                        });
                    }, delay);
                }
            }
        };
        setup(0);

        const app = (logEvent) => {
            lines.push(Buffer.from(`${layout(logEvent, timezoneOffset)}\n`));
            setup();
        };
        app.shutdown = (resolve) => {
            if (timerId !== undefined) {
                timerId = clearTimeout(timerId);
            }
            flush(() => {
                // // eslint-disable-next-line
                // console.log('log4js-safe-rotate-appender: teardown');
                resolve();
            });
        };
        // // eslint-disable-next-line
        // console.log('log4js-safe-rotate-appender: setup');

        return app;
    },
};
