import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const CHAINLINK_CONFIG = {
  optimismSepolia: {
    functions_router: "0xC17094E3A1348E5C7544D4fF8A36c28f2C6AAE28",
    ccip_router: "0x114A20A10b43D4115e5aeef7345a1A71d2a60C57",
    chain_selector: "5224473277236331295",
  },
  arbitrumSepolia: {
    functions_router: "0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C",
    ccip_router: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165",
    chain_selector: "3478487238524512106",
  },
};

const source_chain = "arbitrumSepolia"; // names set in hardhat.config.ts
const destination_chains = ["optimismSepolia"];
type T_networkName = "optimismSepolia" | "arbitrumSepolia";

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
  const { name } = hre.network;
  const networkName: T_networkName = name as T_networkName;

  if ([...destination_chains, source_chain].includes(networkName) === false) {
    console.log("Network not supported: ", networkName);
    return;
  }

  console.log("Deploying contracts to network: ", networkName);

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

  const realEstateTokenRegistryDepl = await deploy("RealEstateTokenRegistry", {
    from: deployer,
    // Contract constructor arguments
    args: [
      deployer,
      deployer,
      deployer,
      eas.address,
      CHAINLINK_CONFIG[networkName].ccip_router,
      CHAINLINK_CONFIG[networkName].chain_selector,
    ],
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
    args: [deployer, deployer, CHAINLINK_CONFIG[source_chain].functions_router, realEstateTokenRegistryDepl.address],
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

  const fakeUSDCDepl = await deploy("TotallyFakeUSDC", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });

  await deploy("RealEstateTokenPurchaser", {
    from: deployer,
    args: [realEstateTokenRegistryDepl.address, fakeUSDCDepl.address],
    log: true,
    autoMine: true,
  });
};

export default deployLinkRealContracts;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags RWAToken
deployLinkRealContracts.tags = ["deploy_all"];
