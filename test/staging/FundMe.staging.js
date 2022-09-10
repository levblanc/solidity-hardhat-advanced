const { ethers, getNamedAccounts } = require('hardhat');
const { assert, expect } = require('chai');
const { developmentChains } = require('../../helper-hardhat-config');
const chainId = network.name;

// only run on testnets
developmentChains.includes(chainId)
  ? describe.skip
  : describe('FundMe', async () => {
      let fundMe;
      let deployer;
      const sendValue = ethers.utils.parseEther('1'); // 1 ETH

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract('FundMe', deployer);
      });

      it('Allows people to fund and withdraw', async () => {
        const fundTxRes = await fundMe.fund({ value: sendValue });
        await fundTxRes.wait(1);
        const withdrawTxRes = await fundMe.withdraw();
        await withdrawTxRes.wait(1);

        const endingBalance = await fundMe.provider.getBalance(fundMe.address);
        const endingBalanceStr = endingBalance.toString();

        console.log(
          `>>>>>> ${endingBalanceStr} should equal 0, running assert equal...`
        );

        assert.equal(endingBalanceStr, '0');
      });
    });
