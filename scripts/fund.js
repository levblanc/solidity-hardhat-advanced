const { getNamedAccounts, ethers } = require('hardhat');

const fund = async () => {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract('FundMe', deployer);
  const sendValue = ethers.utils.parseEther('0.1');

  console.log('>>>>>> Funding...');

  const txRes = await fundMe.fund({ value: sendValue });
  txRes.wait(1);

  console.log('>>>>>> Fund success!');
};

fund()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
