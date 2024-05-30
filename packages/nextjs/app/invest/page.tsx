"use client";

import { useEffect, useState } from "react";
import { NextPage } from "next";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Invest: NextPage = () => {
  const [propertyData, setPropertyData] = useState<any[]>([]);
  const { data, isLoading } = useScaffoldReadContract({
    contractName: "RealEstateTokenRegistry",
    functionName: "allPropertyData",
  });

  const { writeContractAsync } = useScaffoldWriteContract("RealEstateTokenPurchaser");

  const handleInvest = async (propertyOwner: string, propertyId: bigint, fractions: bigint) => {
    await writeContractAsync({
      functionName: "purchasePropertyFraction",
      args: [propertyOwner, propertyId, fractions],
    });
  };

  useEffect(() => {
    if (data) {
      const filtered = data.filter((property: any) => property.isListed === true);
      setPropertyData(filtered);
    }
  }, [data]);

  return (
    <div className="max-w-3xl mx-auto mt-10 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Real Estate Listings</h1>
      <div className="mt-5 w-full flex flex-col items-center">
        <ul className="mt-10 w-full flex flex-col items-center">
          {isLoading ? (
            <li>Loading...</li>
          ) : propertyData && propertyData.length ? (
            propertyData.map((property: any, index: number) => (
              <div key={index} className="w-full flex justify-center">
                <div className="card card-side bg-base-100 shadow-xl">
                  <figure className="w-64 h-64 overflow-hidden mt-5">
                    <img
                      className="w-full h-full object-cover"
                      src={property.metadata.propertyImageURL ? property.metadata.propertyImageURL : "/real_estate.png"}
                      alt="Property Image"
                    />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title">{`Id: - 00${property.propertyId.toString()}`}</h2>
                    <div className="mb-5">
                      <strong>Address:</strong> {property.propertyAddress}
                      <br />
                      <strong>List Value:</strong> {property.propertyListValue.toString()}
                      <br />
                      <strong>Property Appraisal:</strong> {property.propertyValueAppraisal.toString()}
                      <br />
                      <strong>Fractions:</strong> {property.propertyFractionsCount.toString()}
                      <br />
                      <strong>Photo:</strong> {property.metadata.propertyImageURL}
                      <br />
                      <strong>Description:</strong> {property.metadata.description}{" "}
                    </div>
                    <div className="card-actions justify-end">
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          handleInvest(property.propertyOwner, property.propertyId, property.propertyFractionsCount)
                        }
                      >
                        Invest
                      </button>
                    </div>
                  </div>
                </div>{" "}
              </div>
            ))
          ) : (
            <li>No Listings found</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Invest;
