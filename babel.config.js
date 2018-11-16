module.exports = api => {
    api.cache(true);

    return {
        presets: [
            [require('@babel/preset-env'), {
                modules: false,
            }],
            require('@babel/preset-typescript'),
        ],
        plugins: [
            [require('@babel/plugin-proposal-class-properties'), {
                loose: true,
            }],
        ],
    };
};
