const { deployments, ethers, getNamedAccounts } = require('hardhat');
const { assert, expect } = require('chai');

describe('FundMe', () => {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const sendValue = ethers.utils.parseEther('1'); // 1 ETH

  beforeEach(async () => {
    // Deploy FundMe contract with harthat-deploy
    deployer = (await getNamedAccounts()).deployer;
    // Deploy scripts that has the `all` tag inside `deploy` folder
    await deployments.fixture(['all']);
    fundMe = await ethers.getContract('FundMe', deployer);
    mockV3Aggregator = await ethers.getContract('MockV3Aggregator', deployer);
  });

  describe('constructor', async () => {
    it('sets the aggregator addresses correctly', async () => {
      const response = await fundMe.s_priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  describe('fund', async () => {
    it("Fails if you don't send enough ETH", async () => {
      await expect(fundMe.fund()).to.be.revertedWith("Didn't send enough!");
    });

    it('Updated the amount funded data structure', async () => {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.s_addressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });

    it('Adds funders to array of funders', async () => {
      await fundMe.fund({ value: sendValue });
      const funder = await fundMe.s_funders(0);
      assert.equal(funder, deployer);
    });
  });

  describe('withdraw', async () => {
    beforeEach(async () => {
      await fundMe.fund({ value: sendValue });
    });

    it('Withdraw ETH from a single funder', async () => {
      // Arrange
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );
      // Act
      const transactionResponse = await fundMe.withdraw();
      const { gasUsed, effectiveGasPrice } = await transactionResponse.wait(1);
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      // Assert
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
    });

    it('Withdraw ETH from multiple funders', async () => {
      // Arrange
      const accounts = await ethers.getSigners();

      for (let i = 0; i < 6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }

      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      // Act
      const transactionResponse = await fundMe.withdraw();
      const { gasUsed, effectiveGasPrice } = await transactionResponse.wait(1);
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      // Assert
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );

      // Make sure all funders are reset properly
      await expect(fundMe.s_funders(0)).to.be.reverted;

      for (i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.s_addressToAmountFunded(accounts[i].address),
          0
        );
      }
    });

    it('Cheaper withdraw ETH from multiple funders', async () => {
      // Arrange
      const accounts = await ethers.getSigners();

      for (let i = 0; i < 6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }

      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      // Act
      const transactionResponse = await fundMe.cheaperWithdraw();
      const { gasUsed, effectiveGasPrice } = await transactionResponse.wait(1);
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      // Assert
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );

      // Make sure all funders are reset properly
      await expect(fundMe.s_funders(0)).to.be.reverted;

      for (i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.s_addressToAmountFunded(accounts[i].address),
          0
        );
      }
    });

    it('Only allows the owner to withdraw', async () => {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnectedContract = await fundMe.connect(attacker);

      await expect(
        attackerConnectedContract.withdraw()
      ).to.be.revertedWithCustomError(
        attackerConnectedContract,
        'FundMe__NotOwner'
      );
    });
  });
});
