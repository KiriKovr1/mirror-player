export default {
    presets: [
        '@babel/env',
        '@babel/react',
        '@babel/typescript',
    ],
    plugins: [
        ['@babel/plugin-transform-runtime',
            {
                regenerator: true,
            },
        ],
        '@babel/plugin-transform-spread',
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-transform-for-of',
        '@babel/plugin-transform-async-to-generator',
    ],
};


  