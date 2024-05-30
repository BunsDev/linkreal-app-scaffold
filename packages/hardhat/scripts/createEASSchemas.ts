import { SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";
import * as hre from "hardhat";

const schemaRegistryContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ownershipVerifierResolverAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
const guarantorResolverAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

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
