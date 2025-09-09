const hre = require("hardhat");

async function main() {
  console.log("Deploying the master VeriVote contract...");

  const VeriVote = await hre.ethers.getContractFactory("VeriVote"); // Make sure the name matches
  const veriVote = await VeriVote.deploy();

  await veriVote.waitForDeployment();

  console.log(`Master VeriVote contract deployed to: ${veriVote.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});