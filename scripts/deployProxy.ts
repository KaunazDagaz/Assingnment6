import { network } from "hardhat";

async function main() {
  const { ethers } = await network.getOrCreate();
  const [deployer] = await ethers.getSigners();

  const implementationAddress = process.env.IMPLEMENTATION_ADDRESS;
  if (!implementationAddress || !ethers.isAddress(implementationAddress)) {
    throw new Error("Set IMPLEMENTATION_ADDRESS to a valid deployed MyTokenV1 implementation address");
  }

  const initialOwner = process.env.INITIAL_OWNER ?? deployer.address;
  if (!ethers.isAddress(initialOwner)) {
    throw new Error("INITIAL_OWNER must be a valid address");
  }

  const initialSupplyInput = process.env.INITIAL_SUPPLY ?? "1000000";
  const initialSupply = ethers.parseEther(initialSupplyInput);

  console.log("Deploying proxy with deployer:", deployer.address);
  console.log("Implementation:", implementationAddress);
  console.log("Initial owner:", initialOwner);
  console.log("Initial supply:", initialSupply.toString());

  const MyTokenV1 = await ethers.getContractFactory("MyTokenV1");
  const initData = MyTokenV1.interface.encodeFunctionData("initialize", [
    initialOwner,
    initialSupply,
  ]);

  const MyTokenProxy = await ethers.getContractFactory("MyTokenProxy");
  const proxy = await MyTokenProxy.deploy(implementationAddress, initData);
  await proxy.waitForDeployment();

  console.log("Proxy deployed to:", await proxy.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
