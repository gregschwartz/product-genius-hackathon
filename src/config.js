// @flow

type Config = {
  rudder: {
    dataPlane: string,
    frontendWriteKey: string,
  },
  posthog: {
    apiKey: string,
  },
};

const commonConfig = {
  rudder: {
    dataPlane: 'https://gamalonanyfop.dataplane.rudderstack.com',
    frontendWriteKey: '27kY7yBhBQW863EaGYqT9NHKzSE',
  },
  posthog: {
    apiKey: 'phc_zeBrdS75KuoxBTRP8b6uXE3vwhOGwYWm0WRUIFo0WAE',
  },
};

const devConfig = {
  ...commonConfig,
};

const integrationConfig = {
  ...commonConfig,
};

const stagingConfig = {
  ...commonConfig,
};

const productionConfig = {
  ...commonConfig,
};

// eslint-disable-next-line no-underscore-dangle
const config: Config = {
  dev: devConfig,
  integration: integrationConfig,
  staging: stagingConfig,
  production: productionConfig,
/* eslint-disable no-undef */
// $FlowIgnore
}[__ENVIRONMENT__] || devConfig;

export default config;
