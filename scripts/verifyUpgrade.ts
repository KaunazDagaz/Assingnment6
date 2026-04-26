import { network } from "hardhat";

async function main() {
  const { ethers } = await network.getOrCreate();

  const proxyAddress = process.env.PROXY_ADDRESS;
  if (!proxyAddress || !ethers.isAddress(proxyAddress)) {
    throw new Error("Set PROXY_ADDRESS to a valid proxy address");
  }

  const checkAddressesRaw = process.env.CHECK_ADDRESSES ?? "";
  const checkAddresses = checkAddressesRaw
    .split(",")
    .map((a) => a.trim())
    .filter((a) => a.length > 0);

  for (const address of checkAddresses) {
    if (!ethers.isAddress(address)) {
      throw new Error(`Invalid address in CHECK_ADDRESSES: ${address}`);
    }
  }

  const token = await ethers.getContractAt("MyTokenV2", proxyAddress);

  console.log("Proxy:", proxyAddress);
  console.log("name():", await token.name());
  console.log("symbol():", await token.symbol());
  console.log("version():", await token.version());
  console.log("totalSupply():", (await token.totalSupply()).toString());

  const upgradeTxHash = process.env.UPGRADE_TX_HASH;
  let preUpgradeBlock: number | undefined;

  if (upgradeTxHash) {
    const receipt = await ethers.provider.getTransactionReceipt(upgradeTxHash);
    if (!receipt) {
      throw new Error("UPGRADE_TX_HASH not found on this network");
    }

    const upgradeBlock = receipt.blockNumber;
    preUpgradeBlock = upgradeBlock > 0 ? upgradeBlock - 1 : 0;

    console.log("upgradeTxHash:", upgradeTxHash);
    console.log("upgradeBlock:", upgradeBlock.toString());
    console.log("preUpgradeBlock:", preUpgradeBlock.toString());
  }

  if (checkAddresses.length === 0) {
    console.log("No CHECK_ADDRESSES provided. Set CHECK_ADDRESSES='addr1,addr2' to verify balances.");
    return;
  }

  for (const address of checkAddresses) {
    const latest = await token.balanceOf(address);
    console.log(`balance latest ${address}:`, latest.toString());

    if (preUpgradeBlock !== undefined) {
      const before = await token.balanceOf(address, { blockTag: preUpgradeBlock });
      console.log(`balance pre-upgrade ${address}:`, before.toString());
      console.log(`unchanged ${address}:`, before === latest);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
