"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { NextPage } from "next";
import { useAccount } from "wagmi";

const ProvideGuarantee: NextPage = () => {
  const { address: connectedWalletAddress } = useAccount();
  const [isGuarantor, setIsGuarantor] = useState<boolean>(false);
  const [ownerAddress, setOwnerAddress] = useState<string>("");
  const [assetDetails, setAssetDetails] = useState<Array<any>>([]);
  const searchParams = useSearchParams();

  const queryWalletAddress = searchParams.get("wallet");

  useEffect(() => {
    const checkGuarantor = async () => {
      try {
        const response = await fetch("/api/check-guarantor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ walletAddress: connectedWalletAddress }),
        });
        const data = await response.json();
        setIsGuarantor(data.isGuarantor);
      } catch (error) {
        console.error("Error checking guarantor:", error);
      }
    };

    if (connectedWalletAddress) {
      checkGuarantor();
    }
  }, [connectedWalletAddress]);

  useEffect(() => {
    if (isGuarantor) {
      fetchAssetDetails();
    }
  }, [isGuarantor]);

  const handleOwnerAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOwnerAddress(e.target.value);
  };

  const fetchAssetDetails = async () => {
    try {
      //   const response = await fetch("/api/asset-details", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({ ownerAddress }),
      //   });
      //   const data = await response.json();
      //   setAssetDetails(data.assetDetails);

      // Dummy data for testing
      const dummyData = [
        {
          id: "1",
          address: "Dummy Address 1",
          total_value: 1000,
          fractions_count: 10,
          description: "Dummy Description 1",
        },
        {
          id: "2",
          address: "Dummy Address 2",
          total_value: 2000,
          fractions_count: 20,
          description: "Dummy Description 2",
        },
      ];
      setAssetDetails(dummyData);
    } catch (error) {
      console.error("Error fetching asset details:", error);
    }
  };

  const handleProvideGuarantee = async (propertyId: string) => {
    setAssetDetails((prevAssetDetails: any) =>
      prevAssetDetails.map((prev: any) => (prev.id === propertyId ? { ...prev, submitting: true } : prev)),
    );
    try {
      const response = await fetch("/api/provide-guarantee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ propertyId, guarantorAddress: connectedWalletAddress }),
      });

      if (response.ok) {
        alert("Guarantee provided successfully");
        fetchAssetDetails(); // Refresh the asset details after providing guarantee
      } else {
        alert("Failed to provide guarantee");
      }
    } catch (error) {
      console.error("Error providing guarantee:", error);
      alert("Failed to provide guarantee");
    }
    setAssetDetails((prevAssetDetails: any) =>
      prevAssetDetails.map((prev: any) => (prev.id === propertyId ? { ...prev, submitting: false } : prev)),
    );
  };

  const handleProvideCollataral = async (propertyId: string) => {
    setAssetDetails((prevAssetDetails: any) =>
      prevAssetDetails.map((prev: any) => (prev.id === propertyId ? { ...prev, submitting: true } : prev)),
    );
    try {
      const response = await fetch("/api/provide-guarantee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ propertyId, guarantorAddress: connectedWalletAddress }),
      });

      if (response.ok) {
        alert("Guarantee provided successfully");
        fetchAssetDetails(); // Refresh the asset details after providing guarantee
      } else {
        alert("Failed to provide guarantee");
      }
    } catch (error) {
      console.error("Error providing guarantee:", error);
      alert("Failed to provide guarantee");
    }
    setAssetDetails((prevAssetDetails: any) =>
      prevAssetDetails.map((prev: any) => (prev.id === propertyId ? { ...prev, submitting: false } : prev)),
    );
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
                value={queryWalletAddress ? queryWalletAddress : ownerAddress}
                onChange={handleOwnerAddressChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter the asset owner's wallet address"
              />
              <button onClick={fetchAssetDetails} className="btn btn-outline btn-sm mt-4">
                Fetch Asset Details
              </button>
            </div>
            {assetDetails.length > 0 && (
              <ul className="space-y-4">
                {assetDetails.map(asset => (
                  <li key={asset.id} className="p-4 border rounded-lg shadow-sm">
                    <p>
                      <strong>Address:</strong> {asset.address}
                    </p>
                    <p>
                      <strong>Total Value:</strong> ${asset.total_value}
                    </p>
                    <p>
                      <strong>Fractions Count:</strong> {asset.fractions_count}
                    </p>
                    <p>
                      <strong>Description:</strong> {asset.description}
                    </p>
                    <button
                      onClick={() => handleProvideCollataral(asset.id)}
                      className="mt-2 btn btn-primary"
                      disabled={asset.submitting}
                    >
                      {asset.submitting ? "Submitting..." : "Provide Collataral"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div>
          {assetDetails.length > 0 && (
            <ul className="space-y-4">
              {assetDetails.map(asset => (
                <li key={asset.id} className="p-4 border rounded-lg shadow-sm">
                  <p>
                    <strong>Address:</strong> {asset.address}
                  </p>
                  <p>
                    <strong>Total Value:</strong> ${asset.total_value}
                  </p>
                  <p>
                    <strong>Fractions Count:</strong> {asset.fractions_count}
                  </p>
                  <p>
                    <strong>Description:</strong> {asset.description}
                  </p>
                  <button
                    onClick={() => handleProvideGuarantee(asset.id)}
                    className="mt-2 btn btn-primary"
                    disabled={asset.submitting}
                  >
                    {asset.submitting ? "Submitting..." : "Provide Guarantee"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ProvideGuarantee;
