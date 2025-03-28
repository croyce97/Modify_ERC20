const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  let TokenFactory, myToken, deployer, user1, user2;

  beforeEach(async function () {
    TokenFactory = await ethers.getContractFactory("MyToken");
    [deployer, user1, user2] = await ethers.getSigners();
    myToken = await TokenFactory.deploy(10000000, 10, 1000);
    await myToken.waitForDeployment();
  });

  it("Should allocate the initial supply to the deployer", async function () {
    const deployerBalance = await myToken.balanceOf(deployer.address);
    expect(deployerBalance).to.equal(ethers.parseUnits("5000000", 18));
  });

  it("Should allow the deployer to mint new tokens", async function () {
    await myToken.mint(user1.address, ethers.parseUnits("1000", 18));
    expect(await myToken.balanceOf(user1.address)).to.equal(ethers.parseUnits("1000", 18));
  });

  it("Should process transactions with a fee", async function () {
    await myToken.mint(user1.address, ethers.parseUnits("1000", 18));

    await myToken.connect(user1).transfer(user2.address, ethers.parseUnits("1000", 18));

    const user2Balance = await myToken.balanceOf(user2.address);
    const deployerBalance = await myToken.balanceOf(deployer.address);

    expect(user2Balance).to.equal(ethers.parseUnits("999", 18));
    expect(deployerBalance).to.be.gt(ethers.parseUnits("5000000", 18));
  });

  it("Should allow the owner to update the transaction fee", async function () {
    await myToken.setFeePercent(50);
    expect(await myToken.feePercent()).to.equal(50);
  });


  it("Should accumulate rewards over time", async function () {
    await myToken.mint(user1.address, ethers.parseUnits("1000", 18));

    await network.provider.send("evm_increaseTime", [10]);
    await network.provider.send("evm_mine");

    await myToken.connect(user1).claimReward();

    const updatedBalance = await myToken.balanceOf(user1.address);
    expect(updatedBalance).to.be.gt(ethers.parseUnits("1000", 18));
  });
});
