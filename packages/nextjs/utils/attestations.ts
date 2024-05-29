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
