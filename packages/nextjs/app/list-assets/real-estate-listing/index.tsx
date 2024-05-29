import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { useAccount, useWriteContract } from "wagmi";
import PropertyCard from "~~/components/PropertyCard";
import PropertyReviewCard from "~~/components/PropertyReviewCard";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldReadContract, useScaffoldWriteContract, useTransactor } from "~~/hooks/scaffold-eth";
import { HOST, chainId } from "~~/settings/config";
import { attestTos } from "~~/utils/attestations";
import { useEthersSigner } from "~~/hooks/easWagmiHooks";

const ListingForm = ({ property, createQueryString }: any) => {
  const { address: connectedWalletAddress } = useAccount();

  const { writeContractAsync, isPending } = useWriteContract();
  const writeTx = useTransactor();

  const { data: currentPropertyId } = useScaffoldReadContract({
    contractName: "RealEstateTokenRegistry",
    functionName: "currentPropertyIdCount",
    args: [connectedWalletAddress],
  });

  console.log("crrentPropertyId", currentPropertyId);

  const initialFormData = {
    owner: "",
    address: "",
    price: "",
    fractions: "",
    photo: "",
    description: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("property formdata", property);
    if (property !== null) {
      setFormData({
        owner: property.propertyOwner || "",
        address: property.propertyAddress || "",
        price: property.propertyListValue.toString() || "",
        fractions: property.propertyFractionsCount.toString() || "",
        photo: property.metadata.propertyImageURL || "",
        description: property.metadata.description || "",
      });
    }
  }, [property]);

  console.log("formDAta", formData);

  const { owner, address, price, fractions, photo, description } = formData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (currentPropertyId === undefined) throw new Error("Failed to fetch current property id");
      const propertyId = currentPropertyId + 1n;
      const writeContractAsyncWithParams = () =>
        writeContractAsync({
          address: deployedContracts[chainId].RealEstateTokenRegistry.address,
          abi: deployedContracts[chainId].RealEstateTokenRegistry.abi,
          functionName: "submitUnlistedProperty",
          args: [owner, address, BigInt(price), BigInt(fractions), photo, description],
        });

      await writeTx(writeContractAsyncWithParams, { blockConfirmations: 1 });
      const propertyIdQuery = createQueryString("propertyId", propertyId);
      const propertyOwnerQuery = createQueryString("propertyOwner", owner);

      router.push(pathname + "?" + propertyIdQuery + "&" + propertyOwnerQuery);

      alert("Form data saved successfully");
    } catch (error) {
      console.error("An error occurred while saving form data transaction:", error);
      alert("An error occurred while saving form data transaction");
    }
    setSubmitting(false);
    setFormData(initialFormData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="mb-4">
          <label htmlFor="owner" className="block font-bold mb-2">
            Owner Address
          </label>
          <input
            type="text"
            id="owner"
            value={owner}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter the Property Owner Address"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="address" className="block font-bold mb-2">
            Address
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter the address"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="price" className="block font-bold mb-2">
            Total Value of the property ( USD )
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter the price in USD"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="fractions" className="block font-bold mb-2">
            Fractions Count
          </label>
          <input
            type="number"
            id="fractions"
            value={fractions}
            onChange={handleChange} // Added onChange handler for fractions
            className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter the number of fractions"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="photo" className="block font-bold mb-2">
            Add a Photo
          </label>
          <input
            type="file"
            className="file-input file-input-bordered file-input-secondary file-input-sm w-full max-w-xs"
            id="photo"
            value={photo}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block font-bold mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter a description"
          />
        </div>
        <div className="flex justify-center">
          <button type="submit" className="btn btn-outline" disabled={property !== null}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

const RequestOwnershipVerifications = () => {
  const { address: connectedWalletAddress } = useAccount();
  const [verifiers, setVerifiers] = useState<any>([]);
  const [selectedVerifier, setSelectedVerifier] = useState("");
  const searchParams = useSearchParams();

  const propertyId = searchParams.get("propertyId");
  const propertyOwner = searchParams.get("propertyOwner");

  const { data: ownershipVerifierStructs } = useScaffoldReadContract({
    contractName: "LinkRealVerifiedEntities",
    functionName: "returnOwnershipVeriferStructs",
  });
  const { writeContractAsync, isPending } = useScaffoldWriteContract("LinkRealVerifiedEntities");

  useEffect(() => {
    // These verifiers can be stored in a offchain database for efficient fetching.
    console.log("Ownership verifier structs", ownershipVerifierStructs);
    const verifierNames = ownershipVerifierStructs
      ? ownershipVerifierStructs.map((verifier: any) => verifier.ownershipVerifierName)
      : [];
    //  setVerifiers(["Land Registry of Asgard", "A Titlte Search Company", "Verifier C"]);
    verifierNames.length && setVerifiers(verifierNames);
  }, [ownershipVerifierStructs]);

  const handleVerifierChange = (e: any) => {
    setSelectedVerifier(e.target.value);
  };

  const handleSubmit = async (e: any) => {
    try {
      e.preventDefault();
      console.log("Selected Verifier:", selectedVerifier);

      await writeContractAsync({
        functionName: "requestOwnershipVerification",
        args: [
          propertyOwner ? propertyOwner : undefined,
          propertyId ? BigInt(propertyId) : undefined,
          selectedVerifier,
        ],
      });

      alert("Request sent successfully");
    } catch (error) {
      console.error("An error occurred while sending request:", error);
      alert("An error occurred while sending request");
    }

    // TODO: Call your backend to add the selected verifier to the property. Verifier should get notified from the backend.
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto flex">
      <select
        id="verifier"
        value={selectedVerifier}
        onChange={handleVerifierChange}
        required
        className="select select-primary w-full max-w-xs"
      >
        <option value="" disabled selected>
          Select a Verifier
        </option>
        {verifiers.map((verifier: any, index: number) => (
          <option key={index} value={verifier}>
            {verifier}
          </option>
        ))}
      </select>
      <button type="submit" className="ml-5 btn-link">
        {isPending ? "Requesting" : "Request"}
      </button>
    </form>
  );
};

const RequestGurantees = () => {
  const [gurantors, setGurantors] = useState<any>([]);
  const [selectedGurantor, setSelectedGurantor] = useState("");
  const account = useAccount();
  const searchParams = useSearchParams();

  const propertyId = searchParams.get("propertyId");
  const propertyOwner = searchParams.get("propertyOwner");

  const { data: guarantorStructs } = useScaffoldReadContract({
    contractName: "LinkRealVerifiedEntities",
    functionName: "returnGuarantorStructs",
  });

  const { writeContractAsync, isPending } = useScaffoldWriteContract("LinkRealVerifiedEntities");

  useEffect(() => {
    // setGurantors(["Asset Holder Capital", "Some Gurantor Company", "Gurantor C"]);
    console.log("Guarantor structs", guarantorStructs);
    const guarantorNames = guarantorStructs ? guarantorStructs.map((guarantor: any) => guarantor.guarantorName) : [];
    guarantorNames.length && setGurantors(guarantorNames);
  }, []);

  const handleGurantorChange = (e: any) => {
    setSelectedGurantor(e.target.value);
  };

  const handleSubmit = async (e: any) => {
    try {
      e.preventDefault();
      // setSubmitting(true);
      console.log({ selectedGurantor });

      await writeContractAsync({
        functionName: "requestGuarantee",
        args: [
          propertyOwner ? propertyOwner : undefined,
          propertyId ? BigInt(propertyId) : undefined,
          selectedGurantor,
        ],
      });

      alert("Request sent successfully");
    } catch (error) {
      console.error("An error occurred while sending request:", error);
      alert("An error occurred while sending request");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit}>
        <label className="block font-bold mb-2">Select a Gurantor</label>
        <div className="flex">
          <select
            id="gurantor"
            value={selectedGurantor}
            onChange={handleGurantorChange}
            required
            className="select select-primary w-full max-w-xs"
          >
            <option value="" disabled selected>
              Select a Gurantor
            </option>
            {gurantors.map((gurantor: any, index: number) => (
              <option key={index} value={gurantor}>
                {gurantor}
              </option>
            ))}
          </select>
          <button type="submit" className="ml-5 btn-link">
            {isPending ? "Requesting" : "Request"}
          </button>
        </div>
      </form>
      <div className="mt-10 collapse collapse-open">
        <input type="checkbox" className="peer" />
        <div className="collapse-title bg-secondary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content">
          Or Go to this link and add collataral ( by yourself or via thid party )
        </div>
        <div className="collapse-content bg-primary text-primary-content peer-checked:bg-primary peer-checked:text-secondary-content">
          <a href={`${HOST}/asset-gurantees?wallet=${account.address}`} className="link" target="_blank">
            {`${HOST}/asset-gurantees?wallet=${account.address}`}
          </a>
        </div>
      </div>
    </div>
  );
};

const SignTOS = () => {
  const [tosAccepted, setTosAccepted] = useState(false);
  const signer = useEthersSigner();
  // const signer = useSigner()

  const handleTosChange = (e: any) => {
    setTosAccepted(e.target.checked);
  };

  const handleSignTOS = async () => {
    try {
      await attestTos(signer);
      alert("TOS signed successfully");
    } catch (error) {
      console.error("An error occurred while signing TOS:", error);
      alert("An error occurred while signing TOS");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <p className="block font-bold">
        Please read this carefully before signing as this is a legally binding contract.
      </p>
      <div className="flex items-center">
        <input type="checkbox" id="tos" checked={tosAccepted} onChange={handleTosChange} />
        <label htmlFor="tos" className="ml-3">
          I agree to the{" "}
          <a href={`${HOST}/tos`} className="link" target="_blank">
            Terms of Service
          </a>
        </label>
      </div>
      <button disabled={!tosAccepted} className="btn btn-primary mt-5" onClick={handleSignTOS}>
        Sign TOS
      </button>
    </div>
  );
};

const ReviewAndList = ({ property }: any) => {
  const { writeContractAsync, isPending } = useScaffoldWriteContract("RealEstateTokenRegistry");
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const propertyOwner = searchParams.get("propertyOwner");
  console.log("propertyId", propertyId);

  const { data: fetchedProperty, isLoading: isLoadingProperty } = useScaffoldReadContract({
    contractName: "RealEstateTokenRegistry",
    functionName: "propertyData",
    args: [propertyOwner ? propertyOwner : undefined, propertyId ? BigInt(propertyId) : undefined],
  });

  const handleConfirm = async () => {
    if (!fetchedProperty || isLoadingProperty) return;
    await writeContractAsync({
      functionName: "issueRWA",
      // @ts-ignore
      args: [fetchedProperty.propertyOwner, fetchedProperty.propertyId, fetchedProperty.propertyFractionsCount, "0x0"],
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {!isLoadingProperty && fetchedProperty ? (
        <>
          <h2 className="font-bold mb-4">Review Your Listing</h2>
          <PropertyReviewCard property={fetchedProperty} handleConfirm={handleConfirm} />
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

const IndividualAssetListing = ({ property }: any | null) => {
  const steps = [
    { number: 1, title: "Listing Form" },
    { number: 2, title: "Request ownership Verfications" },
    { number: 3, title: "Request Asset Gurantees" },
    { number: 4, title: "Sign TOS" },
    { number: 5, title: "Review and List" },
  ];
  const [step, setStep] = useState(1);

  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  // useEffect(() => {
  //   console.log("property", property);
  //   if (property) {
  //     createQueryString("propertyId", property.propertyId);
  //     createQueryString("propertyOwner", property.propertyOwner);
  //   }
  // }, []);

  const handleStepChange = (clickedStep: number) => {
    if (clickedStep >= 4) {
      // Call your backend to check if the atleast one gurantor has been added.
      const guranterAdded = true;
      if (!guranterAdded) {
        alert("Please add a gurantor to proceed");
        return;
      }
    }
    setStep(clickedStep);
  };

  return (
    <div className="flex flex-col">
      <ul className="steps mb-10">
        {steps.map(({ number, title }) => (
          <li
            className={clsx("step", { "step-primary": step === number })}
            onClick={() => handleStepChange(number)}
            key={number}
          >
            {title}
          </li>
        ))}
      </ul>
      {step === 1 && <ListingForm property={property} createQueryString={createQueryString} />}
      {step === 2 && <RequestOwnershipVerifications />}
      {step === 3 && <RequestGurantees />}
      {step === 4 && <SignTOS />}
      {step === 5 && <ReviewAndList property={property} />}
    </div>
  );
};

const RealEstateListing = () => {
  const [isListing, setIsListing] = useState(false);
  const [property, setProperty] = useState<any | null>(null);
  const [propertyOwnerWallet, setPropertyOwnerWallet] = useState("");
  const { address: connectedWalletAddress } = useAccount();
  const router = useRouter();
  const pathname = usePathname();

  const { data: propertyData, isLoading } = useScaffoldReadContract({
    contractName: "RealEstateTokenRegistry",
    functionName: "propertyDataByOwner",
    args: [propertyOwnerWallet ? propertyOwnerWallet : connectedWalletAddress],
  });

  return (
    <>
      {isListing || property !== null ? (
        <IndividualAssetListing property={property} />
      ) : (
        <div className="max-w-3xl mx-auto mt-10 flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-6">Real Estate Listings</h1>
          <button
            className="btn btn-outline btn-xs"
            onClick={() => {
              router.push(pathname);
              setIsListing(prevIsListing => !prevIsListing);
            }}
          >
            {"Create a new Listing"}
          </button>
          <div className="mt-5 w-full flex flex-col items-center">
            <input
              type="text"
              placeholder="Enter Property Owner Wallet"
              className="input input-bordered input-xs w-full max-w-xs"
              onChange={e => setPropertyOwnerWallet(e.target.value)}
              value={propertyOwnerWallet ? propertyOwnerWallet : connectedWalletAddress}
            />
            <ul className="mt-10 w-full flex flex-col items-center">
              {isLoading ? (
                <li>Loading...</li>
              ) : propertyData && propertyData.length ? (
                propertyData.map((property: any, index: number) => (
                  <div key={index} className="w-full flex justify-center">
                    <PropertyCard property={property} setProperty={setProperty} />
                  </div>
                ))
              ) : (
                <li>No Listings found</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default RealEstateListing;
