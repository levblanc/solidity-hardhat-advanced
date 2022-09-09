require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();
require('hardhat-deploy');

const { RINKEBY_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: 'hardhat',
  solidity: {
    compilers: [{ version: '0.8.8' }, { version: '0.7.0' }],
  },
  networks: {
    // yarn hardhat run scripts/deploy.js --network rinkeby
    rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 4,
      blockConfirmations: 6,
    },
    // To spin up a local hardhat node:
    // yarn hardhat node
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    },
  },
  etherscan: {
    // apiKey: ETHERSCAN_API_KEY,
    apiKey: {
      rinkeby: ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: 'rinkeby',
        chainId: 4,
        urls: {
          apiURL: 'http://api-rinkeby.etherscan.io/api',
          browserURL: 'https://rinkeby.etherscan.io',
        },
      },
    ],
  },
  gasReporter: {
    enabled: false, // set to true when needs a report
    outputFile: 'gas-report.md',
    noColors: true,
    // currency: 'USD',
    token: 'MATIC',
  },
};
