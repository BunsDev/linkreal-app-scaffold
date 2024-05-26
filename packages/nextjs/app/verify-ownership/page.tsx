"use client";

import { useEffect, useState } from "react";
import { NextPage } from "next";

const VerifyOwnership: NextPage = () => {
  const [verificationRequests, setVerificationRequests] = useState<any>([]);

  useEffect(() => {
    // Fetch pending verification requests
    const fetchRequests = async () => {
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

    fetchRequests();
  }, []);

  const handleVerify = async (request: any) => {
    setVerificationRequests((prevRequests: any) =>
      prevRequests.map((prevRequest: any) =>
        prevRequest.id === request.id ? { ...prevRequest, submitting: true } : prevRequest,
      ),
    );

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate successful verification
      alert("Verification successful");

      // Update the list of verification requests
      setVerificationRequests((prevRequests: any) =>
        prevRequests.filter((prevRequest: any) => prevRequest.id !== request.id),
      );
    } catch (error) {
      console.error("Error verifying ownership:", error);
      alert("Verification failed");
      setVerificationRequests((prevRequests: any) =>
        prevRequests.map((prevRequest: any) =>
          prevRequest.id === request.id ? { ...prevRequest, submitting: false } : prevRequest,
        ),
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
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
                onClick={() => handleVerify(request)}
                className="mt-2 btn btn-primary"
                disabled={request.submitting}
              >
                {request.submitting ? "Verifying..." : "Verify Ownership"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VerifyOwnership;
