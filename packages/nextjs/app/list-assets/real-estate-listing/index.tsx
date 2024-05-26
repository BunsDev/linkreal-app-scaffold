import { useEffect, useState } from "react";
import clsx from "clsx";
import { useAccount } from "wagmi";

const ListingForm = () => {
  const { address: connectedWalletAddress } = useAccount();
  const initialFormData = {
    address: "",
    price: "",
    fractions: "",
    description: "",
    photo: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  const { address, price, fractions, description, photo } = formData;

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
      const formData = { address, price, fractions, photo, description };
      const response = await fetch("/api/list-assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData, connectedWalletAddress }),
      });
      console.log({ response });
      if (response.ok) {
        console.log("Form data submitted successfully", response);
      } else {
        alert("Failed to submit form data");
      }
    } catch (error) {
      console.error("An error occurred while submitting form data:", error);
    }
    setSubmitting(false);
    setFormData(initialFormData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
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

const OwnershipVerification = () => {
  const [verifiers, setVerifiers] = useState<any>([]);
  const [selectedVerifier, setSelectedVerifier] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch pre-vetted verifiers from your backend or hardcode for now
    setVerifiers(["Land Registry of Asgard", "A Titlte Search Company", "Verifier C"]);
  }, []);

  const handleVerifierChange = (e: any) => {
    setSelectedVerifier(e.target.value);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    console.log("Selected Verifier:", selectedVerifier);

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
        {submitting ? "Submitting" : "Submit"}
      </button>
    </form>
  );
};

const IncludeGurantees = () => {
  const [gurantors, setGurantors] = useState<any>([]);
  const [selectedGurantor, setSelectedGurantor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch pre-vetted Gurantors from your backend or hardcode for now
    setGurantors(["Asset Holder Capital", "Some Gurantor Company", "Gurantor C"]);
  }, []);

  const handleGurantorChange = (e: any) => {
    setSelectedGurantor(e.target.value);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    console.log({ selectedGurantor });

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
            {submitting ? "Submitting" : "Submit"}
          </button>
        </div>
      </form>
      <div className="mt-10 collapse collapse-open">
        <input type="checkbox" className="peer" />
        <div className="collapse-title bg-secondary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content">
          Or Go to this link and add collataral ( by yourself or via thid party )
        </div>
        <div className="collapse-content bg-primary text-primary-content peer-checked:bg-primary peer-checked:text-secondary-content">
          <a href="https://docs.attest.org/docs/tutorials/create-a-schema" className="link" target="_blank">
            https://docs.attest.org/docs/tutorials/create-a-schema
          </a>
        </div>
      </div>
    </div>
  );
};

const RealEstateListing = () => {
  const steps = [
    { number: 1, title: "Listing Form" },
    { number: 2, title: "Add ownership Verfications" },
    { number: 3, title: "Add Gurantees" },
    { number: 4, title: "Sign TOS" },
    { number: 5, title: "Review and List" },
  ];
  const [step, setStep] = useState(1);

  const handleStepChange = (clickedStep: number) => {
    if (clickedStep >= 4) {
      // Call your backend to check if the atleast one gurantor has been added.
      const guranterAdded = false;
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
      {step === 2 && <OwnershipVerification />}
      {step === 3 && <IncludeGurantees />}
    </div>
  );
};

export default RealEstateListing;
