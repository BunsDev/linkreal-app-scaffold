import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployLinkRealContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const schemaRegistry = await deploy("SchemaRegistry", {
    from: deployer,
    // Contract constructor arguments
    args: [],
    log: true,
    autoMine: true,
  });

  const eas = await deploy("EAS", {
    from: deployer,
    args: [schemaRegistry.address],
    log: true,
    autoMine: true,
  });

  await deploy("RealEstateTokenRegistry", {
    from: deployer,
    // Contract constructor arguments
    args: [deployer, deployer, deployer, eas.address],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  await deploy("LinkRealVerifiedEntities", {
    from: deployer,
    // Contract constructor arguments
    args: [deployer, deployer],
    log: true,
    autoMine: true,
  });

  await deploy("AssetValueUpdater", {
    from: deployer,
    args: [deployer, deployer],
    log: true,
    autoMine: true,
  });

  await deploy("OwnershipVerifierAttestationResolver", {
    from: deployer,
    args: [eas.address],
    log: true,
    autoMine: true,
  });

  await deploy("GuarantorAttestationResolver", {
    from: deployer,
    args: [eas.address],
    log: true,
    autoMine: true,
  });
};

export default deployLinkRealContracts;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags RWAToken
deployLinkRealContracts.tags = ["all"];
