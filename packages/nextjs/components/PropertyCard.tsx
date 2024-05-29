import React from "react";

// TODO: add types
const PropertyCard = ({ property }: any) => {
  return (
    <div className="card card-side bg-base-100 shadow-xl">
      <figure className="w-64 h-64 overflow-hidden mt-5">
        <img
          className="w-full h-full object-cover"
          src={
            property.metadata.photoURL
              ? property.metadata.photoURL
              : "/real_estate.png"
          }
          alt="Property Image"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{`Id: - 00${property.propertyId.toString()}`}</h2>
        <li className="mb-5">
          <strong>Address:</strong> {property.propertyAddress}
          <br />
          <strong>Price:</strong> {property.propertyListValue.toString()}
          <br />
          <strong>Fractions:</strong> {property.propertyFractionsCount.toString()}
          <br />
          <strong>Photo:</strong> {property.metadata.photo}
          <br />
          <strong>Description:</strong> {property.metadata.description}{" "}
        </li>
        <div className="card-actions justify-end">
          <button className="btn btn-primary">View</button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
