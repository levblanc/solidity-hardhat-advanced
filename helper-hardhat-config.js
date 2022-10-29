const networkConfig = {
  5: {
    name: 'goerli',
    ethUsdPriceFeed: '0xA39434A63A52E749F02807ae27335515BA4b07F7',
  },
  137: {
    name: 'polygon',
    ethUsdPriceFeed: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
  },
};

const developmentChains = ['hardhat', 'localhost'];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
};
