import { expect } from "chai";
import { network } from "hardhat";

describe("MyToken", function () {
  it("Should deploy with correct initial supply", async function () {
    const { ethers } = await network.getOrCreate();
    const [deployer] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken");
    const initialSupply = ethers.parseEther("1000000");
    const myToken = await MyToken.deploy(initialSupply);

    await myToken.waitForDeployment();

    expect(await myToken.balanceOf(deployer.address)).to.equal(initialSupply);
  });

  it("Should allow only owner to mint tokens", async function () {
    const { ethers } = await network.getOrCreate();
    const [owner, otherAccount] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy(ethers.parseEther("1000000"));
    await myToken.waitForDeployment();

    const mintAmount = ethers.parseEther("100");
    await myToken.mint(otherAccount.address, mintAmount);

    expect(await myToken.balanceOf(otherAccount.address)).to.equal(mintAmount);
    await expect(
      myToken.connect(otherAccount).mint(otherAccount.address, mintAmount)
    )
      .to.be.revertedWithCustomError(myToken, "OwnableUnauthorizedAccount")
      .withArgs(otherAccount.address);
    expect(await myToken.owner()).to.equal(owner.address);
  });

  it("Should transfer tokens between accounts", async function () {
    const { ethers } = await network.getOrCreate();
    const [deployer, recipient] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken");
    const initialSupply = ethers.parseEther("1000000");
    const myToken = await MyToken.deploy(initialSupply);
    await myToken.waitForDeployment();
    const transferAmount = ethers.parseEther("250");

    await myToken.transfer(recipient.address, transferAmount);

    expect(await myToken.balanceOf(recipient.address)).to.equal(transferAmount);
    expect(await myToken.balanceOf(deployer.address)).to.equal(
      initialSupply - transferAmount
    );
  });

  it("Should revert when transferring more than available balance", async function () {
    const { ethers } = await network.getOrCreate();
    const [, senderWithZeroBalance, recipient] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy(ethers.parseEther("1000000"));
    await myToken.waitForDeployment();
    const transferAmount = ethers.parseEther("1");

    await expect(
      myToken.connect(senderWithZeroBalance).transfer(recipient.address, transferAmount)
    )
      .to.be.revertedWithCustomError(myToken, "ERC20InsufficientBalance")
      .withArgs(senderWithZeroBalance.address, 0, transferAmount);
  });
});
