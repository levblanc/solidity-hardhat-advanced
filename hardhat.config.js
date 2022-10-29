require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();
require('hardhat-deploy');

const { GOERLI_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: 'hardhat',
  solidity: {
    compilers: [{ version: '0.8.8' }, { version: '0.7.0' }],
  },
  networks: {
    // yarn hardhat run scripts/deploy.js --network goerli
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
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
    apiKey: ETHERSCAN_API_KEY,
    customChains: [
      {
        network: 'goerli',
        chainId: 5,
        urls: {
          apiURL: 'http://api-goerli.etherscan.io/api',
          browserURL: 'https://goerli.etherscan.io',
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
