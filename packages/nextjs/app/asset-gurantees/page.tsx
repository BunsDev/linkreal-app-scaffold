"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { readContract } from "@wagmi/core";
import { NextPage } from "next";
import { useAccount } from "wagmi";
import { useEthersSigner } from "~~/hooks/easWagmiHooks";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { attestAsPropertyGuarantor } from "~~/utils/attestations";

const ProvideGuarantee: NextPage = () => {
  const { address: connectedWalletAddress } = useAccount();
  const [isGuarantor, setIsGuarantor] = useState<boolean>(false);
  const [ownerAddressInput, setOwnerAddressInput] = useState<string>("");
  const [submittedOwnerAddressInput, setSubmittedOwnerAddressInput] = useState<string>("");
  // TODO: add types to assetDetails
  const [assetGuaranteeRequests, setAssetDetails] = useState<any>([]);
  const searchParams = useSearchParams();
  const queryWalletAddress = searchParams.get("wallet");

  const easSigner = useEthersSigner();

  const { data: guaranteeRequestData, isLoading } = useScaffoldReadContract({
    contractName: "LinkRealVerifiedEntities",
    functionName: "guaranteeRequestsByGuarantor",
    args: [connectedWalletAddress],
  });

  const { data: isAssetGurantor } = useScaffoldReadContract({
    contractName: "LinkRealVerifiedEntities",
    functionName: "isGuarantor",
    args: [connectedWalletAddress],
  });

  const { data: ownerPropertyData } = useScaffoldReadContract({
    contractName: "RealEstateTokenRegistry",
    functionName: "propertyDataByOwner",
    args: [submittedOwnerAddressInput],
  });

  const { writeContractAsync: writeContractAsyncLRVE, isPending: isPendingLRVE } =
    useScaffoldWriteContract("LinkRealVerifiedEntities");
  const { writeContractAsync: writeContractAsyncRETR, isPending: isPendingRETR } =
    useScaffoldWriteContract("RealEstateTokenRegistry");

  useEffect(() => {
    setIsGuarantor(Boolean(isAssetGurantor));
  }, [connectedWalletAddress, isAssetGurantor]);

  useEffect(() => {
    if (isGuarantor) {
      const pendingApprovalRequests = guaranteeRequestData?.filter((request: any) => request.isApproved === false);
      setAssetDetails(pendingApprovalRequests);
    }
  }, [isGuarantor]);

  useEffect(() => {
    // TODO: filter asset details that have the requierd collataral amount
    ownerPropertyData?.length && setAssetDetails(ownerPropertyData);
  }, [ownerPropertyData]);

  const handleOwnerAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOwnerAddressInput(e.target.value);
  };

  const handleProvideGuarantee = async (propertyId: bigint, propertyOwner: string) => {
    setAssetDetails((prevAssetDetails: any) =>
      prevAssetDetails.map((prev: any) => (prev.propertyId === propertyId ? { ...prev, submitting: true } : prev)),
    );
    try {
      console.log({ propertyOwner });
      const attestationUID = await attestAsPropertyGuarantor(easSigner, Number(propertyId), propertyOwner);
      await writeContractAsyncRETR({
        functionName: "provideGurantee",
        args: [propertyId, propertyOwner, attestationUID as `0x${string}`],
      });
      await writeContractAsyncLRVE({
        functionName: "approveGuaranteeRequest",
        args: [propertyOwner, propertyId],
      });

      alert("Guarantee provided successfully");

      // Update the list of requests
      setAssetDetails((prevRequests: any) =>
        prevRequests.filter((prevRequest: any) => prevRequest.propertyId !== propertyId),
      );
    } catch (error) {
      console.error("Error providing guarantee:", error);
      setAssetDetails((prevAssetDetails: any) =>
        prevAssetDetails.map((prev: any) => (prev.propertyId === propertyId ? { ...prev, submitting: false } : prev)),
      );
      alert("Failed to provide guarantee");
    }
  };

  const handleProvideCollataral = async (propertyId: bigint, propertyOwner: string) => {
    setAssetDetails((prevAssetDetails: any) =>
      prevAssetDetails.map((prev: any) => (prev.propertyId === propertyId ? { ...prev, submitting: true } : prev)),
    );
    try {
      await writeContractAsyncRETR({
        functionName: "provideGurantee",
        args: [propertyId, propertyOwner, `0x0000000000000000000000000000000000000000000000000000000000000000`],
        value: 100n, // TODO: fetch the required collataral instead hardcoded 100 wei value
      });
      await writeContractAsyncLRVE({
        functionName: "approveGuaranteeRequest",
        args: [propertyOwner, propertyId],
      });

      alert("Guarantee provided successfully");

      // Update the list of requests
      setAssetDetails((prevRequests: any) =>
        prevRequests.filter((prevRequest: any) => prevRequest.propertyId !== propertyId),
      );
    } catch (error) {
      console.error("Error providing guarantee:", error);
      setAssetDetails((prevAssetDetails: any) =>
        prevAssetDetails.map((prev: any) => (prev.propertyId === propertyId ? { ...prev, submitting: false } : prev)),
      );
      alert("Failed to provide guarantee via collataral");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Provide Asset Guarantees</h1>
      {!isGuarantor ? (
        <div>
          <p className="mb-4">You're not an authorized guarantor. You can provide collateral instead.</p>

          <div>
            <div className="mb-4">
              {/* <label htmlFor="ownerAddress" className="block font-bold mb-2">
                Asset Owner Wallet Address
              </label> */}
              <input
                type="text"
                id="ownerAddress"
                value={queryWalletAddress ? queryWalletAddress : ownerAddressInput}
                onChange={handleOwnerAddressChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter the asset owner's wallet address"
              />
              <button
                onClick={() => setSubmittedOwnerAddressInput(ownerAddressInput)}
                className="btn btn-outline btn-sm mt-4"
              >
                Fetch Asset Gurantee Requests
              </button>
            </div>
            {assetGuaranteeRequests.length > 0 && (
              <ul className="space-y-4">
                {assetGuaranteeRequests.map((request: any) => (
                  <li key={request.propertyId} className="p-4 border rounded-lg shadow-sm">
                    <p>
                      <strong>Owner:</strong> {request.propertyOwner}
                    </p>
                    <p>
                      <strong>Property Id:</strong> {request.propertyId.toString()}
                    </p>
                    <button
                      onClick={() => handleProvideCollataral(request.propertyId, request.propertyOwner)}
                      className="mt-2 btn btn-primary"
                      disabled={request.submitting || isAssetGurantor}
                    >
                      {request.submitting ? "Submitting..." : "Provide Collataral"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div>
          {assetGuaranteeRequests.length > 0 ? (
            <ul className="space-y-4">
              {assetGuaranteeRequests.map((request: any) => (
                <li key={request.propertyId} className="p-4 border rounded-lg shadow-sm">
                  <p>
                    <strong>Owner:</strong> {request.propertyOwner}
                  </p>
                  <p>
                    <strong>Property Id:</strong> {request.propertyId.toString()}
                  </p>
                  <p>
                    <strong>Requested Guarantor:</strong> {request.requestedGuarantor}
                  </p>
                  <button
                    onClick={() => handleProvideGuarantee(request.propertyId, request.propertyOwner)}
                    className="mt-2 btn btn-primary"
                    disabled={request.submitting}
                  >
                    {request.submitting ? "Submitting..." : "Provide Guarantee"}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No pending requests.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProvideGuarantee;
