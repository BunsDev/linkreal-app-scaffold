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
const subcriptionId = 88;
const gasLimit: bigint = 1_000_000n;
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
      subcriptionId,
      gasLimit,
      donId,
      source,
    );

    const receipt = await tx.wait();

    console.log("receipt: ", receipt);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
