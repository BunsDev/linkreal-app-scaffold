import { SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";
import * as hre from "hardhat";

const schemaRegistryContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ownershipVerifierResolverAddress = "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82";
const guarantorResolverAddress = "0x9A676e781A523b5d0C0e43731313A708CB607508";

async function main() {
  const [signer0] = await hre.ethers.getSigners();
  const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);

  schemaRegistry.connect(signer0);

  await registerOwnershipVerifierSchema(schemaRegistry);
  await registerGuarantorSchema(schemaRegistry);
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
  await transaction.wait();
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
  await transaction.wait();
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
