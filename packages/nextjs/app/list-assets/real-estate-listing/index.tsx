import { useState } from "react";
import clsx from "clsx";

const ListingForm = () => {
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [fractions, setFractions] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = { address, price, fractions }; // Updated formData
      const response = await fetch("/api/list-assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        console.log("Form data submitted successfully");
      } else {
        console.log("Failed to submit form data");
      }
    } catch (error) {
      console.error("An error occurred while submitting form data:", error);
    }
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
            onChange={e => setAddress(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter the address"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="price" className="block font-bold mb-2">
            Price ( USD )
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={e => setPrice(e.target.value)}
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
            onChange={e => setFractions(e.target.value)} // Added onChange handler for fractions
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
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block font-bold mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter a description"
            required
          />
        </div>
        <div className="flex justify-center">
          <button type="submit" className="btn btn-outline">
            Submit
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
