import React, { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// TODO: add types
const PropertyCard = ({ property, setProperty }: any) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const handlePropertySelect = () => {    
    setProperty(property);

    const params = new URLSearchParams(searchParams.toString());
    params.set("propertyId", property.propertyId.toString());
    params.set("propertyOwner", property.propertyOwner.toString());

    router.push(pathname + "?" + params.toString());
  };

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
          <strong>Address:</strong> {property.propertyAddress}
          <br />
          <strong>Price:</strong> {property.propertyListValue.toString()}
          <br />
          <strong>Fractions:</strong> {property.propertyFractionsCount.toString()}
          <br />
          <strong>Photo:</strong> {property.metadata.propertyImageURL}
          <br />
          <strong>Description:</strong> {property.metadata.description}{" "}
        </div>
        <div className="card-actions justify-end">
          <button className="btn btn-primary" onClick={() => handlePropertySelect()}>
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
