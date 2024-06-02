import deployedContracts from "~~/contracts/deployedContracts";

export const HOST = "http://localhost:3000";

export const chainId = 421614;

export const EASConfig = {
  [chainId]: {
    contracts: {
      EAS: deployedContracts[chainId].EAS.address,
      SchemaRegistry: "",
    },
    schemaUIDs: {
      OwnershipVerifier: "0xcff76e6b72e584d7c5510f59447e0633b243e3277eb479cbea932e6f8371f4b0",
      Guarantor: "0x4813b575ad8f151b96c46a1745e946288f2abcec76fcfba2cb63eb5d9d57c03b",
      TOS: "0x8960db49adcbef2a058007ebcf4df60234e013e51fc871d13cb15a5fffece011",
    },
  },
};

export const TokenPurchaserContractAddress = ""