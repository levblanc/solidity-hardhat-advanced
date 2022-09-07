require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();
require('hardhat-deploy');

const { RINKEBY_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [{ version: '0.8.8' }, { version: '0.7.0' }],
  },
  networks: {
    // yarn hardhat run scripts/deploy.js --network rinkeby
    rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 4,
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
};
