//changed script because the one specified in the task didn't work with the new version of hardhat
import { network } from "hardhat";

async function main() {
  const { ethers } = await network.getOrCreate();

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);
  const MyToken = await ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy(ethers.parseEther("1000000"));
  await myToken.waitForDeployment();
  console.log("MyToken deployed to:", await myToken.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
