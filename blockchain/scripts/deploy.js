const hre = require("hardhat");

async function main() {
  const electionName = "CR Election Fall 2025 (Blockchain)";
  const candidateNames = ["Priya Sharma", "Rohan Verma"]; // Initial candidates

  console.log("Deploying contract with the following details:");
  console.log("Election Name:", electionName);
  console.log("Candidates:", candidateNames.join(', '));

  const Election = await hre.ethers.getContractFactory("Election");
  const election = await Election.deploy(electionName, candidateNames);

  await election.waitForDeployment();

  console.log(`Election contract deployed to: ${election.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});