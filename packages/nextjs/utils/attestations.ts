import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { EASConfig, chainId } from "~~/settings/config";

export const attestTos = async (signer: any) => {
  const eas = new EAS(EASConfig[chainId].contracts.EAS, signer);
  eas.connect(signer);

  // Initialize SchemaEncoder with the schema string
  const schemaEncoder = new SchemaEncoder("address propertyOwner, string claimByPropertyOwner");
  const encodedData = schemaEncoder.encodeData([
    { type: "address", value: signer.address, name: "propertyOwner" },
    { type: "string", value: "I agree to the terms of service", name: "claimByPropertyOwner" },
  ]);

  const schemaUID = EASConfig[chainId].schemaUIDs.TOS;

  const tx = await eas.attest({
    schema: schemaUID,
    data: {
      recipient: signer.address,
      expirationTime: 0n,
      revocable: true, // Be aware that if your schema is not revocable, this MUST be false
      data: encodedData,
    },
  });

  const tosAttestationUID = await tx.wait();
  console.log({ tosAttestationUID });
};

export const attestToPropertyOwnership = async (signer: any, propertyId: number, propertyOwner: string) => {
  const eas = new EAS(EASConfig[chainId].contracts.EAS, signer);
  eas.connect(signer);

  // Initialize SchemaEncoder with the schema string
  const schemaEncoder = new SchemaEncoder("uint256 propertyId, address owner, string claimByOwnershipVerifier");
  const encodedData = schemaEncoder.encodeData([
    { type: "uint256", value: propertyId, name: "propertyId" },
    { type: "address", value: propertyOwner, name: "owner" },
    {
      type: "string",
      value: `I hereby as authorized property verifier attest this property belongs to the property owner: ${propertyOwner}`,
      name: "claimByOwnershipVerifier",
    },
  ]);

  const schemaUID = EASConfig[chainId].schemaUIDs.OwnershipVerifier;

  const tx = await eas.attest({
    schema: schemaUID,
    data: {
      recipient: signer.address,
      expirationTime: 0n,
      revocable: true, // Be aware that if your schema is not revocable, this MUST be false
      data: encodedData,
    },
  });

  const ownershipAttestationUID = await tx.wait();
  console.log({ ownershipAttestationUID });
  return ownershipAttestationUID;
};

export const attestAsPropertyGuarantor = async (signer: any, propertyId: number, propertyOwner: string) => {
  const eas = new EAS(EASConfig[chainId].contracts.EAS, signer);
  eas.connect(signer);

  // Initialize SchemaEncoder with the schema string
  const schemaEncoder = new SchemaEncoder("uint256 propertyId, address owner, string claimByGuarantor");
  const encodedData = schemaEncoder.encodeData([
    { type: "uint256", value: propertyId, name: "propertyId" },
    { type: "address", value: propertyOwner, name: "owner" },
    {
      type: "string",
      value: `I hereby as guarantor attest this property is in the custody of mine and to make up for any losses in case property owner breaches the agreement.`,
      name: "claimByGuarantor",
    },
  ]);

  const schemaUID = EASConfig[chainId].schemaUIDs.Guarantor;

  const tx = await eas.attest({
    schema: schemaUID,
    data: {
      recipient: signer.address,
      expirationTime: 0n,
      revocable: true, // Be aware that if your schema is not revocable, this MUST be false
      data: encodedData,
    },
  });

  const guarantorAttestationUID = await tx.wait();
  console.log({ guarantorAttestationUID });
  return guarantorAttestationUID;
};
