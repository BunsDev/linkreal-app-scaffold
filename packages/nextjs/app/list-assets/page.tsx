"use client";

import { useState } from "react";
import { NextPage } from "next";

const MenuItems = ({ setSelectedOption }: any) => {
  const menuItems = [{ title: "Real Estate" }, { title: "Stocks" }, { title: "Fine Art" }, { title: "Carbon Credits" }];

  return (
    <div className="flex justify-center items-center flex-grow">
      <ul className="menu bg-base-200 w-56 rounded-box">
        {menuItems.map(({ title }) => (
          <li key={title}>
            <button
              className="btn btn-primary p-4 mb-6"
              onClick={_ => setSelectedOption(title)}
              disabled={title !== "Real Estate"}
            >
              {title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const RealEstateListing = () => {
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ address, price, description });
    try {
      const formData = { address, price, description };
      const response = await fetch('/api/list-assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        console.log('Form data submitted successfully');
      } else {
        console.log('Failed to submit form data');
      }
    } catch (error) {
      console.error('An error occurred while submitting form data:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto py-10">
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

const ListAssets: NextPage = () => {
  const [selectedOption, setSelectedOption] = useState("");

  return (
    <>
      {!selectedOption ? (
        <MenuItems setSelectedOption={setSelectedOption} />
      ) : (
        <>
          {selectedOption === "Real Estate" && <RealEstateListing />}
          {selectedOption === "Stocks" && <div>Stocks</div>}
          {selectedOption === "Fine Art" && <div>Fine Art</div>}
          {selectedOption === "Carbon Credits" && <div>Carbon Credits</div>}
        </>
      )}
    </>
  );
};

export default ListAssets;
