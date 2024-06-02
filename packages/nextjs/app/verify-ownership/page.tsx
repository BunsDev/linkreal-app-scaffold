"use client";

import { useEffect, useState } from "react";
import { NextPage } from "next";
import { useAccount } from "wagmi";
import { useEthersSigner } from "~~/hooks/easWagmiHooks";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { attestToPropertyOwnership } from "~~/utils/attestations";

const VerifyOwnership: NextPage = () => {
  // TODO: add types to verificationRequests
  const [verificationRequests, setVerificationRequests] = useState<any>([]);
  const [isVerifier, setIsVerifier] = useState<boolean>(false);
  const { address: connectedWalletAddress } = useAccount();
  const easSigner = useEthersSigner();

  const { data: verificationRequestData, isLoading } = useScaffoldReadContract({
    contractName: "LinkRealVerifiedEntities",
    functionName: "ownershipVerificationRequestsByVerifier",
    args: [connectedWalletAddress],
  });

  const { data: isOwnershipVerifier } = useScaffoldReadContract({
    contractName: "LinkRealVerifiedEntities",
    functionName: "isOwnershipVerifier",
    args: [connectedWalletAddress],
  });

  const { writeContractAsync: writeContractAsyncLRVE } = useScaffoldWriteContract("LinkRealVerifiedEntities");
  const { writeContractAsync: writeContractAsyncRETR } = useScaffoldWriteContract("RealEstateTokenRegistry");

  useEffect(() => {
    console.log({ data: verificationRequestData });
    const pendingApprovalRequests = verificationRequestData?.filter((request: any) => request.isApproved === false);
    setVerificationRequests(pendingApprovalRequests);
  }, [verificationRequestData]);

  useEffect(() => {
    setIsVerifier(Boolean(isOwnershipVerifier));
  }, [connectedWalletAddress, isOwnershipVerifier]);

  const handleVerify = async (propertyId: bigint, propertyOwner: string) => {
    setVerificationRequests((prevRequests: any) =>
      prevRequests?.map((prevRequest: any) =>
        prevRequest.propertyId === propertyId ? { ...prevRequest, submitting: true } : prevRequest,
      ),
    );

    try {
      const attestationUID = await attestToPropertyOwnership(easSigner, Number(propertyId), propertyOwner);
      await writeContractAsyncRETR({
        functionName: "provideOwnershipVerification",
        args: [propertyId, propertyOwner, attestationUID as `0x${string}`],
      });
      await writeContractAsyncLRVE({
        functionName: "approveOwnershipVerificationRequest",
        args: [propertyOwner, propertyId],
      });

      // Update the list of verification requests
      setVerificationRequests((prevRequests: any) =>
        prevRequests.filter((prevRequest: any) => prevRequest.propertyId !== propertyId),
      );

      alert("Verification successful");
    } catch (error) {
      console.error("Error verifying ownership:", error);
      setVerificationRequests((prevRequests: any) =>
        prevRequests?.map((prevRequest: any) =>
          prevRequest.propertyId === propertyId ? { ...prevRequest, submitting: false } : prevRequest,
        ),
      );
      alert("Verification failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      {isVerifier ? (
        <>
          <h1 className="text-2xl font-bold mb-6">Pending Verification Requests</h1>
          {verificationRequests?.length <= 0 ? (
            <p>No pending verification requests.</p>
          ) : (
            <ul className="space-y-4">
              {verificationRequests?.map((request: any) => (
                <li key={request.propertyId} className="p-4 border rounded-lg shadow-sm">
                  <p>
                    <strong>Owner:</strong> {request.propertyOwner}
                  </p>
                  <p>
                    <strong>Property Id:</strong> {request.propertyId.toString()}
                  </p>
                  <p>
                    <strong>Requested Verifier:</strong> {request.requestedVerifier}
                  </p>
                  <button
                    onClick={() => handleVerify(request.propertyId, request.propertyOwner)}
                    className="mt-2 btn btn-primary"
                    disabled={request.submitting}
                  >
                    {request.submitting ? "Verifying..." : "Verify Ownership"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <h2 className="text-2xl font-bold">You're not an authorized verifier!</h2>
      )}
    </div>
  );
};

export default VerifyOwnership;
