const { getNamedAccounts, ethers } = require('hardhat');

const withdraw = async () => {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract('FundMe', deployer);

  console.log('>>>>>> Withdrawing...');

  const txRes = await fundMe.withdraw();
  await txRes.wait(1);

  console.log('>>>>>> Withdraw success!');
};

withdraw()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
