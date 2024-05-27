"use client";

import { useEffect, useState } from "react";
import { NextPage } from "next";
import { useAccount } from "wagmi";

const VerifyOwnership: NextPage = () => {
  // TODO: add types to verificationRequests
  const [verificationRequests, setVerificationRequests] = useState<any>([]);
  const [isVerifier, setIsVerifier] = useState<boolean>(false);
  const { address: connectedWalletAddress } = useAccount();

  const fetchRequests = async () => {
    // Fetch pending verification requests

    // TODO: api call to fetch pending verification requests
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Dummy data for verification requests
    const dummyData = [
      {
        id: 1,
        address: "Dummy Address 1",
        total_value: 1000,
        fractions_count: 10,
        description: "Dummy Description 1",
      },
      {
        id: 2,
        address: "Dummy Address 2",
        total_value: 2000,
        fractions_count: 20,
        description: "Dummy Description 2",
      },
      // Add more dummy data as needed
    ];

    setVerificationRequests(dummyData);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const checkVerifier = async () => {
    // TODO:
    // 1. call smart contract function to check if the connected wallet address is a verifier
    // 2. set setIsVerifier based on the result
    // TODO: Also update the db to reflect that the property has been verified

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Dummy data for verifier check
    const isVerifier = true;

    setIsVerifier(isVerifier);
  };

  useEffect(() => {
    checkVerifier();
  }, [connectedWalletAddress]);

  const handleVerify = async (requestId: string) => {
    setVerificationRequests((prevRequests: any) =>
      prevRequests.map((prevRequest: any) =>
        prevRequest.id === requestId ? { ...prevRequest, submitting: true } : prevRequest,
      ),
    );

    try {
      // TODO:
      // 1. Popup metamask and get the signed attestation from the verifier
      // 2. Save Attestation in the smart contract.

      const simulateTx = await new Promise(resolve => setTimeout(resolve, 1000));

      alert("Verification successful");

      // Update the list of verification requests
      setVerificationRequests((prevRequests: any) =>
        prevRequests.filter((prevRequest: any) => prevRequest.id !== requestId),
      );
    } catch (error) {
      console.error("Error verifying ownership:", error);
      alert("Verification failed");
      setVerificationRequests((prevRequests: any) =>
        prevRequests.map((prevRequest: any) =>
          prevRequest.id === requestId ? { ...prevRequest, submitting: false } : prevRequest,
        ),
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      {isVerifier ? (
        <>
          <h1 className="text-2xl font-bold mb-6">Pending Verification Requests</h1>
          {verificationRequests.length === 0 ? (
            <p>No pending verification requests.</p>
          ) : (
            <ul className="space-y-4">
              {verificationRequests.map((request: any) => (
                <li key={request.id} className="p-4 border rounded-lg shadow-sm">
                  <p>
                    <strong>Address:</strong> {request.address}
                  </p>
                  <p>
                    <strong>Total Value:</strong> ${request.total_value}
                  </p>
                  <p>
                    <strong>Fractions Count:</strong> {request.fractions_count}
                  </p>
                  <p>
                    <strong>Description:</strong> {request.description}
                  </p>
                  <button
                    onClick={() => handleVerify(request.id)}
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
