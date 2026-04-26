import { network } from "hardhat";

async function main() {
  const { ethers } = await network.getOrCreate();
  const [deployer] = await ethers.getSigners();
  console.log("Deploying MyTokenV1 logic contract with:", deployer.address);
  const MyTokenV1 = await ethers.getContractFactory("MyTokenV1");
  const implementation = await MyTokenV1.deploy();
  await implementation.waitForDeployment();
  console.log("MyTokenV1 implementation deployed to:", await implementation.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
