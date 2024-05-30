import React from "react";

// TODO: add types
const PropertyReviewCard = ({ property, handleConfirm }: any) => {
  return (
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
          <strong>Owner:</strong> {property.propertyOwner}
          <br />
          <strong>Address:</strong> {property.propertyAddress}
          <br />
          <strong>List Value:</strong> {property.propertyListValue.toString()}
          <br />
          <strong>Property Appraisal:</strong> {property.propertyValueAppraisal.toString()}
          <br />
          <strong>Fractions:</strong> {property.propertyFractionsCount.toString()}
          <br />
          <strong>Ownership Verifier: </strong>{" "}
          {property.propertyOwnershipVerifier === "0x0000000000000000000000000000000000000000"
            ? "Not set"
            : property.propertyOwnershipVerifier}
          <br />
          <strong>Guarantor: </strong>{" "}
          {property.propertyGuarantor === "0x0000000000000000000000000000000000000000"
            ? "Not set"
            : property.propertyGuarantor}
          <br />
          <strong>Collateral Amount</strong>{" "}
          {property.propertyCollateralAmount ? property.propertyCollateralAmount.toString() : 0}
          <br />
          <strong>Photo:</strong> {property.metadata.propertyImageURL ? property.metadata.propertyImageURL : "Not set"}
          <br />
          <strong>Description:</strong> {property.metadata.description}{" "}
        </div>
        <div className="card-actions justify-end">
          <button className="btn btn-primary" onClick={() => handleConfirm()}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyReviewCard;
