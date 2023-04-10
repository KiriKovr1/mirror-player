const configDefault = {
    server: {
        host: '0.0.0.0',
        port: 3999,
    },
    pensionServer: {
        host: 'http://localhost:',
        port: 5100,
    },
    logger: {
        logsDir: 'logs/',
        logsDaysKeep: 7,
        logsDaysHistory: 1095,
        logsDelayedError: null,
    },
};

export default configDefault;
