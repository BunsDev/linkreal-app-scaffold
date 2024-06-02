import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CHAINLINK_CONFIG, T_networkName, source_chain } from "./00_deploy_contracts";

const verifyContracts = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments } = hre;
  const { deployer } = await hre.getNamedAccounts();
  const { name } = hre.network;
  const networkName: T_networkName = name as T_networkName;

  const schemaRegistryDepl = await deployments.get("SchemaRegistry");
  const easDepl = await deployments.get("EAS");
  const realEstateTokenRegistryDepl = await deployments.get("RealEstateTokenRegistry");
  const linkRealVEDepl = await deployments.get("LinkRealVerifiedEntities");
  const assetValueUDepl = await deployments.get("AssetValueUpdater");
  const owResolverDepl = await deployments.get("OwnershipVerifierAttestationResolver");
  const guResolverDepl = await deployments.get("GuarantorAttestationResolver");
  const fakeUSDCDepl = await deployments.get("TotallyFakeUSDC");
  const realEstTokPurchDepl = await deployments.get("RealEstateTokenPurchaser");

  await hre.run("verify:verify", {
    address: schemaRegistryDepl.address,
    constructorArguments: [],
  });

  await hre.run("verify:verify", {
    address: easDepl.address,
    constructorArguments: [schemaRegistryDepl.address],
  });

  await hre.run("verify:verify", {
    address: realEstateTokenRegistryDepl.address,
    constructorArguments: [
      deployer,
      deployer,
      deployer,
      easDepl.address,
      CHAINLINK_CONFIG[networkName].ccip_router,
      CHAINLINK_CONFIG[networkName].chain_selector,
    ],
  });

  await hre.run("verify:verify", {
    address: linkRealVEDepl.address,
    constructorArguments: [deployer, deployer],
  });

  await hre.run("verify:verify", {
    address: assetValueUDepl.address,
    constructorArguments: [
      deployer,
      deployer,
      CHAINLINK_CONFIG[source_chain].functions_router,
      realEstateTokenRegistryDepl.address,
    ],
  });

  await hre.run("verify:verify", {
    address: owResolverDepl.address,
    constructorArguments: [easDepl.address],
    contract:
      "contracts/EAS/attester_resolvers/OwnershipVerifierAttestationResolver.sol:OwnershipVerifierAttestationResolver",
  });

  await hre.run("verify:verify", {
    address: guResolverDepl.address,
    constructorArguments: [easDepl.address],
    contract: "contracts/EAS/attester_resolvers/GuarantorAttestationResolver.sol:GuarantorAttestationResolver",
  });

  await hre.run("verify:verify", {
    address: fakeUSDCDepl.address,
    constructorArguments: [deployer],
  });

  await hre.run("verify:verify", {
    address: realEstTokPurchDepl.address,
    constructorArguments: [realEstateTokenRegistryDepl.address, fakeUSDCDepl.address],
  });
};

export default verifyContracts;

verifyContracts.tags = ["verify"];
verifyContracts.dependencies = ["deploy_all"];
