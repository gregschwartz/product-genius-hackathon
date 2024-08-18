const branch = process.env.GITHUB_REF_NAME || 'localhost';
const environment = (['main', 'master'].includes(branch)) ? 'production' : branch;

module.exports = (api) => {
  const isDevelopment = api.env() !== 'production';
  api.cache.using(() => environment);
  return {
    presets: [
      '@babel/preset-flow',
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'entry',
          corejs: '3.22',
          targets: '> 1.25%, not dead',
          modules: false,
        },
      ],
      // Enable development transform of React with new automatic runtime
      [
        '@babel/preset-react',
        { development: isDevelopment, runtime: 'automatic' },
      ],
    ],
    // Applies the react-refresh Babel plugin on non-production modes only
    ...(isDevelopment && { plugins: ['react-refresh/babel'] }),
  };
};
