import * as hre from "hardhat";
import { readFileSync } from "fs";
import path from "path";
import {
  SubscriptionManager,
  simulateScript,
  ResponseListener,
  ReturnType,
  decodeResult,
  FulfillmentCode,
} from "@chainlink/functions-toolkit";
import { ethers } from "ethers";

const propertyOwner = "0x9BD348A8c28A95B256C0262d6Af33ad9912f6073";
const propertyId = "1";
const subscriptionId = 88;
const gasLimit: bigint = 300_000n;
const donId = "0x66756e2d617262697472756d2d7365706f6c69612d3100000000000000000000";
const source = readFileSync(path.resolve(__dirname, "../chainlink-functions/source/getPrices.js")).toString();

async function main() {
  const [signer0] = await hre.ethers.getSigners();

  const { deployments } = hre;

  const assetValueUpdaterDepl = await deployments.get("AssetValueUpdater");

  const assetValueUpdater = await hre.ethers.getContractAt("AssetValueUpdater", assetValueUpdaterDepl.address, signer0);

  const args = [propertyOwner, propertyId];

  console.log("Start simulation...");

  const response = await simulateScript({
    source: source,
    args: args,
    bytesArgs: [], // bytesArgs - arguments can be encoded off-chain to bytes.
    secrets: {}, // no secrets in this example
  });

  console.log("Simulation result", response);

  const tx = await assetValueUpdater.updatePriceDetailsInitiate(
    propertyOwner,
    propertyId,
    subscriptionId,
    gasLimit,
    donId,
    source,
  );

  const receipt = await tx.wait();

  console.log("receipt: ", receipt);

  // const testConsumerContract = new ethers.Contract(
  //   "0x92373801402F0608157dc654fDD18b5a01A45C1e",
  //   [
  //     {
  //       inputs: [],
  //       name: "acceptOwnership",
  //       outputs: [],
  //       stateMutability: "nonpayable",
  //       type: "function",
  //     },
  //     {
  //       inputs: [
  //         {
  //           internalType: "address",
  //           name: "router",
  //           type: "address",
  //         },
  //       ],
  //       stateMutability: "nonpayable",
  //       type: "constructor",
  //     },
  //     {
  //       inputs: [],
  //       name: "EmptyArgs",
  //       type: "error",
  //     },
  //     {
  //       inputs: [],
  //       name: "EmptySecrets",
  //       type: "error",
  //     },
  //     {
  //       inputs: [],
  //       name: "EmptySource",
  //       type: "error",
  //     },
  //     {
  //       inputs: [
  //         {
  //           internalType: "bytes32",
  //           name: "requestId",
  //           type: "bytes32",
  //         },
  //         {
  //           internalType: "bytes",
  //           name: "response",
  //           type: "bytes",
  //         },
  //         {
  //           internalType: "bytes",
  //           name: "err",
  //           type: "bytes",
  //         },
  //       ],
  //       name: "handleOracleFulfillment",
  //       outputs: [],
  //       stateMutability: "nonpayable",
  //       type: "function",
  //     },
  //     {
  //       inputs: [],
  //       name: "NoInlineSecrets",
  //       type: "error",
  //     },
  //     {
  //       inputs: [],
  //       name: "OnlyRouterCanFulfill",
  //       type: "error",
  //     },
  //     {
  //       inputs: [
  //         {
  //           internalType: "bytes32",
  //           name: "requestId",
  //           type: "bytes32",
  //         },
  //       ],
  //       name: "UnexpectedRequestID",
  //       type: "error",
  //     },
  //     {
  //       anonymous: false,
  //       inputs: [
  //         {
  //           indexed: true,
  //           internalType: "address",
  //           name: "from",
  //           type: "address",
  //         },
  //         {
  //           indexed: true,
  //           internalType: "address",
  //           name: "to",
  //           type: "address",
  //         },
  //       ],
  //       name: "OwnershipTransferRequested",
  //       type: "event",
  //     },
  //     {
  //       anonymous: false,
  //       inputs: [
  //         {
  //           indexed: true,
  //           internalType: "address",
  //           name: "from",
  //           type: "address",
  //         },
  //         {
  //           indexed: true,
  //           internalType: "address",
  //           name: "to",
  //           type: "address",
  //         },
  //       ],
  //       name: "OwnershipTransferred",
  //       type: "event",
  //     },
  //     {
  //       anonymous: false,
  //       inputs: [
  //         {
  //           indexed: true,
  //           internalType: "bytes32",
  //           name: "id",
  //           type: "bytes32",
  //         },
  //       ],
  //       name: "RequestFulfilled",
  //       type: "event",
  //     },
  //     {
  //       anonymous: false,
  //       inputs: [
  //         {
  //           indexed: true,
  //           internalType: "bytes32",
  //           name: "id",
  //           type: "bytes32",
  //         },
  //       ],
  //       name: "RequestSent",
  //       type: "event",
  //     },
  //     {
  //       anonymous: false,
  //       inputs: [
  //         {
  //           indexed: true,
  //           internalType: "bytes32",
  //           name: "requestId",
  //           type: "bytes32",
  //         },
  //         {
  //           indexed: false,
  //           internalType: "bytes",
  //           name: "response",
  //           type: "bytes",
  //         },
  //         {
  //           indexed: false,
  //           internalType: "bytes",
  //           name: "err",
  //           type: "bytes",
  //         },
  //       ],
  //       name: "Response",
  //       type: "event",
  //     },
  //     {
  //       inputs: [
  //         {
  //           internalType: "string",
  //           name: "source",
  //           type: "string",
  //         },
  //         {
  //           internalType: "bytes",
  //           name: "encryptedSecretsUrls",
  //           type: "bytes",
  //         },
  //         {
  //           internalType: "uint8",
  //           name: "donHostedSecretsSlotID",
  //           type: "uint8",
  //         },
  //         {
  //           internalType: "uint64",
  //           name: "donHostedSecretsVersion",
  //           type: "uint64",
  //         },
  //         {
  //           internalType: "string[]",
  //           name: "args",
  //           type: "string[]",
  //         },
  //         {
  //           internalType: "bytes[]",
  //           name: "bytesArgs",
  //           type: "bytes[]",
  //         },
  //         {
  //           internalType: "uint64",
  //           name: "subscriptionId",
  //           type: "uint64",
  //         },
  //         {
  //           internalType: "uint32",
  //           name: "gasLimit",
  //           type: "uint32",
  //         },
  //         {
  //           internalType: "bytes32",
  //           name: "donID",
  //           type: "bytes32",
  //         },
  //       ],
  //       name: "sendRequest",
  //       outputs: [
  //         {
  //           internalType: "bytes32",
  //           name: "requestId",
  //           type: "bytes32",
  //         },
  //       ],
  //       stateMutability: "nonpayable",
  //       type: "function",
  //     },
  //     {
  //       inputs: [
  //         {
  //           internalType: "bytes",
  //           name: "request",
  //           type: "bytes",
  //         },
  //         {
  //           internalType: "uint64",
  //           name: "subscriptionId",
  //           type: "uint64",
  //         },
  //         {
  //           internalType: "uint32",
  //           name: "gasLimit",
  //           type: "uint32",
  //         },
  //         {
  //           internalType: "bytes32",
  //           name: "donID",
  //           type: "bytes32",
  //         },
  //       ],
  //       name: "sendRequestCBOR",
  //       outputs: [
  //         {
  //           internalType: "bytes32",
  //           name: "requestId",
  //           type: "bytes32",
  //         },
  //       ],
  //       stateMutability: "nonpayable",
  //       type: "function",
  //     },
  //     {
  //       inputs: [
  //         {
  //           internalType: "address",
  //           name: "to",
  //           type: "address",
  //         },
  //       ],
  //       name: "transferOwnership",
  //       outputs: [],
  //       stateMutability: "nonpayable",
  //       type: "function",
  //     },
  //     {
  //       inputs: [],
  //       name: "owner",
  //       outputs: [
  //         {
  //           internalType: "address",
  //           name: "",
  //           type: "address",
  //         },
  //       ],
  //       stateMutability: "view",
  //       type: "function",
  //     },
  //     {
  //       inputs: [],
  //       name: "s_lastError",
  //       outputs: [
  //         {
  //           internalType: "bytes",
  //           name: "",
  //           type: "bytes",
  //         },
  //       ],
  //       stateMutability: "view",
  //       type: "function",
  //     },
  //     {
  //       inputs: [],
  //       name: "s_lastRequestId",
  //       outputs: [
  //         {
  //           internalType: "bytes32",
  //           name: "",
  //           type: "bytes32",
  //         },
  //       ],
  //       stateMutability: "view",
  //       type: "function",
  //     },
  //     {
  //       inputs: [],
  //       name: "s_lastResponse",
  //       outputs: [
  //         {
  //           internalType: "bytes",
  //           name: "",
  //           type: "bytes",
  //         },
  //       ],
  //       stateMutability: "view",
  //       type: "function",
  //     },
  //   ],
  //   signer0,
  // );

  // const transaction = await testConsumerContract.sendRequest(
  //   source, // source
  //   "0x", // user hosted secrets - encryptedSecretsUrls - empty in this example
  //   0, // don hosted secrets - slot ID - empty in this example
  //   0, // don hosted secrets - version - empty in this example
  //   args,
  //   [], // bytesArgs - arguments can be encoded off-chain to bytes.
  //   subscriptionId,
  //   gasLimit,
  //   donId, // jobId is bytes32 representation of donId
  // );

  // console.log("transactionhash", transaction)
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
