const hre = require("hardhat");

async function main() {

  const JokesContract = await hre.ethers.getContractFactory("JokesContract");
  const deployed = await JokesContract.deploy();

  await deployed.deployed();

  const JokesNFTContract = await hre.ethers.getContractFactory("JokeNFT");
  const deployedNFT = await JokesNFTContract.deploy();

  await deployedNFT.deployed();

  console.log("Contract JokesContract deployed to:", deployed.address);
  storeContractData(deployed, "JokesContract");

  console.log("Contract JokesNFTContract deployed to:", deployedNFT.address);
  storeContractData(deployedNFT, "JokeNFT");

}

function storeContractData(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}Address.json`,
    JSON.stringify({ [name]: contract.address }, undefined, 2)
  );


  const ContractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(ContractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

