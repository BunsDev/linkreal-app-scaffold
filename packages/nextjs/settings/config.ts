import deployedContracts from "~~/contracts/deployedContracts";

export const HOST = "http://localhost:3000";

export const chainId = 421614;

export const EASConfig = {
  31337: {
    contracts: {
      EAS: deployedContracts[chainId].EAS.address,
      SchemaRegistry: "",
    },
    schemaUIDs: {
      OwnershipVerifier: "0x07254f3fbf6cae088e05014940e2c73659fa6f7ee75a0cb5d1d84a212fbe7d2c",
      Guarantor: "0x3081e6f73b59c0397e7f565a94f894218970bcbed11832b8521c398b31ec8ac7",
      TOS: "0x8960db49adcbef2a058007ebcf4df60234e013e51fc871d13cb15a5fffece011",
    },
  },
};

export const TokenPurchaserContractAddress = ""