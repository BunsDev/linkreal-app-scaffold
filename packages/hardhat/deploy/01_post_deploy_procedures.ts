import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  GuarantorAttestationResolver,
  LinkRealVerifiedEntities,
  OwnershipVerifierAttestationResolver,
  RealEstateTokenRegistry,
} from "../typechain-types";

const postDeploy = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("Granting Roles and adding target attesters...");

  const assetValueUpdaterDepl = await deployments.get("AssetValueUpdater");

  const realEstateTokenRegistry: RealEstateTokenRegistry = await hre.ethers.getContract("RealEstateTokenRegistry");
  const linkRealVerifiedEntities: LinkRealVerifiedEntities = await hre.ethers.getContract("LinkRealVerifiedEntities");
  const ownershipVerifierAttestationResolver: OwnershipVerifierAttestationResolver = await hre.ethers.getContract(
    "OwnershipVerifierAttestationResolver",
  );
  const guarantorAttestationResolver: GuarantorAttestationResolver = await hre.ethers.getContract(
    "GuarantorAttestationResolver",
  );

  await linkRealVerifiedEntities.setOwnershipVerifierData(
    deployer,
    "The Land Registry of Westeros",
    "https://westeros.gov/land-registry",
  );
  await ownershipVerifierAttestationResolver.addTargetAttester(deployer);
  await guarantorAttestationResolver.addTargetAttester(deployer);

  await linkRealVerifiedEntities.setGuarantorData(deployer, "The Iron Bank of Braavos", "https://theironbank.com");

  const OWNERSHIP_VERIFIER_ROLE = await realEstateTokenRegistry.OWNERSHIP_VERIFIER_ROLE();
  const GUARANTOR_ROLE = await realEstateTokenRegistry.GUARANTOR_ROLE();
  const ASSET_APPRAISAL_UPDATER_ROLE = await realEstateTokenRegistry.ASSET_APPRAISAL_UPDATER_ROLE();
  await realEstateTokenRegistry.grantRole(OWNERSHIP_VERIFIER_ROLE, deployer);
  await realEstateTokenRegistry.grantRole(GUARANTOR_ROLE, deployer);
  await realEstateTokenRegistry.grantRole(ASSET_APPRAISAL_UPDATER_ROLE, assetValueUpdaterDepl.address);

  log(`postDeploy procedure is completed!`);
};

export default postDeploy;

postDeploy.tags = ["post"];
postDeploy.dependencies = ["deploy_all"];
