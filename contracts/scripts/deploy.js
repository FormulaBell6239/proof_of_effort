const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Proof-of-Effort Contract...");

  const ProofOfEffort = await hre.ethers.getContractFactory("ProofOfEffort");
  const proofOfEffort = await ProofOfEffort.deploy();

  await proofOfEffort.waitForDeployment();

  const address = await proofOfEffort.getAddress();
  console.log(`✅ ProofOfEffort deployed to: ${address}`);

  // Add some initial verifiers (for development)
  const [deployer, verifier1, verifier2] = await hre.ethers.getSigners();
  
  console.log("\n📝 Adding initial verifiers...");
  await proofOfEffort.addVerifier(verifier1.address);
  console.log(`   Added verifier: ${verifier1.address}`);
  
  await proofOfEffort.addVerifier(verifier2.address);
  console.log(`   Added verifier: ${verifier2.address}`);

  console.log("\n📋 Deployment Summary:");
  console.log("========================");
  console.log(`Contract Address: ${address}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Network: ${hre.network.name}`);
  console.log("========================\n");

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: address,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    "./deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
