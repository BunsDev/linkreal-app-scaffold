import { useEffect, useState } from "react";
import clsx from "clsx";
import { useAccount, useWriteContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldReadContract, useTransactor } from "~~/hooks/scaffold-eth";
import { HOST, chainId } from "~~/settings/config";

const ListingForm = () => {
  const { address: connectedWalletAddress } = useAccount();

  const { writeContractAsync, isPending } = useWriteContract();
  const writeTx = useTransactor();

  const initialFormData = {
    owner: "",
    address: "",
    price: "",
    fractions: "",
    photo: "",
    description: "",
  };
  const [formData, setFormData] = useState(initialFormData);

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
      const writeContractAsyncWithParams = () =>
        writeContractAsync({
          address: deployedContracts[chainId].RealEstateTokenRegistry.address,
          abi: deployedContracts[chainId].RealEstateTokenRegistry.abi,
          functionName: "submitUnlistedProperty",
          args: [
            formData.owner,
            formData.address,
            BigInt(formData.price),
            BigInt(formData.fractions),
            formData.photo,
            formData.description,
          ],
        });

      await writeTx(writeContractAsyncWithParams, { blockConfirmations: 1 });

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
          <button type="submit" className="btn btn-outline">
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
  const [submitting, setSubmitting] = useState(false);

  const { data: ownershipVerifierStructs } = useScaffoldReadContract({
    contractName: "LinkRealVerifiedEntities",
    functionName: "returnOwnershipVeriferStructs",
  });

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
    e.preventDefault();
    setSubmitting(true);
    console.log("Selected Verifier:", selectedVerifier);

    // TODO: call backend to add the selected verifier for the property
    setTimeout(() => {
      setSubmitting(false);
    }, 1000);
    // Call your backend to add the selected verifier to the property. Verifier should get notified from the backend.
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
        {submitting ? "Requesting" : "Request"}
      </button>
    </form>
  );
};

const RequestGurantees = () => {
  const [gurantors, setGurantors] = useState<any>([]);
  const [selectedGurantor, setSelectedGurantor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const account = useAccount();

  useEffect(() => {
    // TODO: Fetch pre-vetted guarntors via a smart contract external view function. hardcoded for now
    setGurantors(["Asset Holder Capital", "Some Gurantor Company", "Gurantor C"]);
  }, []);

  const handleGurantorChange = (e: any) => {
    setSelectedGurantor(e.target.value);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    console.log({ selectedGurantor });

    // TODO: call backend to add the selected gurantor for the property
    setTimeout(() => {
      setSubmitting(false);
    }, 1000);
    // Call your backend to add the selected verifier to the property. Verifier should get notified from the backend.
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
            {submitting ? "Requesting" : "Request"}
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

  const handleTosChange = (e: any) => {
    setTosAccepted(e.target.checked);
  };

  const handleSignTOS = async () => {
    // TODO: Popup metamask and sign it. Then save attestation in the smart contract.
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

const ReviewAndList = () => {
  const formData: any = {}; // fetch from the backend
  const { address, price, fractions, description, photo } = formData;

  const handleConfirm = async () => {
    // TODO: Call issueRWA function in the smart contract from the connected wallet.
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="font-bold mb-4">Review Your Listing</h2>
      <div className="mb-4">
        <strong>Address:</strong> {address}
      </div>
      <div className="mb-4">
        {/* // this is a value user enters */}
        <strong>Total Value of the property (USD):</strong> {price}
      </div>
      <div className="mb-4">
        <strong>Fractions Count:</strong> {fractions}
      </div>
      <div className="mb-4">
        <strong>Description:</strong> {description}
      </div>
      <div className="mb-4">
        <strong>Photo:</strong> {photo}
      </div>
      <div className="mb-4">
        <strong>Ownership Verifier:</strong> Land Registry of Asgard
      </div>
      <div className="mb-4">
        <strong>Gurantor:</strong> Asset Holder Capital
      </div>
      <div className="mb-4">
        <strong>Collataral:</strong> Not Provided
      </div>
      <div className="mb-4">
        <strong>Terms of Service:</strong> Accepted
      </div>
      <button className="btn btn-primary mt-5" onClick={handleConfirm}>
        Confirm and List
      </button>
    </div>
  );
};

const IndividualAssetListing = () => {
  const steps = [
    { number: 1, title: "Listing Form" },
    { number: 2, title: "Request ownership Verfications" },
    { number: 3, title: "Request Asset Gurantees" },
    { number: 4, title: "Sign TOS" },
    { number: 5, title: "Review and List" },
  ];
  const [step, setStep] = useState(1);

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
          <li className={clsx("step", { "step-primary": step === number })} onClick={() => handleStepChange(number)}>
            {title}
          </li>
        ))}
      </ul>
      {step === 1 && <ListingForm />}
      {step === 2 && <RequestOwnershipVerifications />}
      {step === 3 && <RequestGurantees />}
      {step === 4 && <SignTOS />}
      {step === 5 && <ReviewAndList />}
    </div>
  );
};

const RealEstateListing = () => {
  const [isListing, setIsListing] = useState(false);

  return (
    <>
      {isListing ? (
        <IndividualAssetListing />
      ) : (
        <div className="max-w-3xl mx-auto mt-10 flex-col">
          <h1 className="text-2xl font-bold mb-6">Real Estate Listings</h1>
          <button
            className="btn btn-outline btn-xs ml-10"
            onClick={() => {
              setIsListing(prevIsListing => !prevIsListing);
            }}
          >
            {"Create a new Listing"}
          </button>
          <ul className="mt-10">{/* add listings here */}</ul>
        </div>
      )}
    </>
  );
};

export default RealEstateListing;
