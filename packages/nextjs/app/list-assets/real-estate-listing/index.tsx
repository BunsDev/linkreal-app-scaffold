import { useState } from "react";
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

const RealEstateListing = () => {
  const steps = [
    { number: 1, title: "Listing Form" },
    { number: 2, title: "Add ownership Verfications" },
    { number: 3, title: "Sign TOS" },
    { number: 4, title: "Add Gurantees" },
    { number: 5, title: "Review and List" },
  ];
  const [step, setStep] = useState(1);
  return (
    <div className="flex flex-col">
      <ul className="steps mb-10">
        {steps.map(({ number, title }) => (
          <li className={clsx("step", { "step-primary": step === number })} onClick={_ => setStep(number)}>
            {title}
          </li>
        ))}
      </ul>
      {step === 1 && <ListingForm />}
    </div>
  );
};

export default RealEstateListing;
