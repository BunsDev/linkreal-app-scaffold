import { SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";
import * as hre from "hardhat";

const schemaRegistryContractAddress = "0x947c308D0E6bc08E360a962D17330dD60d80Ae0E";
const ownershipVerifierResolverAddress = "0x0141636c8026225A974C1EA70aF1d123c7750d8D";
const guarantorResolverAddress = "0x784c7A1d55AD424a31f0ab094BcEc3e4ec1558e3";

async function main() {
  const [signer0] = await hre.ethers.getSigners();
  const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);

  schemaRegistry.connect(signer0);

  await registerOwnershipVerifierSchema(schemaRegistry);
  await registerGuarantorSchema(schemaRegistry);
  await TOSSchema(schemaRegistry);
}

async function registerOwnershipVerifierSchema(schemaRegistry: SchemaRegistry) {
  const schema = "uint256 propertyId, address owner, string claimByOwnershipVerifier";
  const revocable = true;

  const transaction = await schemaRegistry.register({
    schema,
    resolverAddress: ownershipVerifierResolverAddress,
    revocable,
  });

  // Optional: Wait for transaction to be validated
  const ownershipVerifierSchemaUid = await transaction.wait();
  console.log({ ownershipVerifierSchemaUid });
}

async function registerGuarantorSchema(schemaRegistry: SchemaRegistry) {
  const schema = "uint256 propertyId, address owner, string claimByGuarantor";
  const revocable = true;

  const transaction = await schemaRegistry.register({
    schema,
    resolverAddress: guarantorResolverAddress,
    revocable,
  });

  // Optional: Wait for transaction to be validated
  const guarnatorSchemaUid = await transaction.wait();
  console.log({ guarnatorSchemaUid });
}

async function TOSSchema(schemaRegistry: SchemaRegistry) {
  const schema = "address propertyOwner, string claimByPropertyOwner";
  const revocable = true;

  const transaction = await schemaRegistry.register({
    schema,
    revocable,
  });

  // Optional: Wait for transaction to be validated
  const tosSchemaUID = await transaction.wait();
  console.log({ tosSchemaUID });
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
