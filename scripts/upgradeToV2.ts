import { network } from "hardhat";

async function main() {
  const { ethers } = await network.getOrCreate();
  const [caller] = await ethers.getSigners();

  const proxyAddress = process.env.PROXY_ADDRESS;
  const implementationV2Address = process.env.V2_IMPLEMENTATION_ADDRESS;

  if (!proxyAddress || !ethers.isAddress(proxyAddress)) {
    throw new Error("Set PROXY_ADDRESS to a valid proxy address");
  }

  if (!implementationV2Address || !ethers.isAddress(implementationV2Address)) {
    throw new Error("Set V2_IMPLEMENTATION_ADDRESS to a valid MyTokenV2 implementation address");
  }

  console.log("Upgrading proxy with caller:", caller.address);
  console.log("Proxy:", proxyAddress);
  console.log("New implementation:", implementationV2Address);

  const proxyAsV1 = await ethers.getContractAt("MyTokenV1", proxyAddress);
  const tx = await proxyAsV1.upgradeToAndCall(implementationV2Address, "0x");

  console.log("Upgrade tx hash:", tx.hash);
  const receipt = await tx.wait();
  console.log("Upgrade confirmed in block:", receipt?.blockNumber);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
