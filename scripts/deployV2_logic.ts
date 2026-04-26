import { network } from "hardhat";

async function main() {
  const { ethers } = await network.getOrCreate();
  const [deployer] = await ethers.getSigners();
  console.log("Deploying MyTokenV2 logic contract with:", deployer.address);
  const MyTokenV2 = await ethers.getContractFactory("MyTokenV2");
  const implementationV2 = await MyTokenV2.deploy();
  await implementationV2.waitForDeployment();
  console.log("MyTokenV2 implementation deployed to:", await implementationV2.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
