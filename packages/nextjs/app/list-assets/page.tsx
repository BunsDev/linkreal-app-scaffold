"use client";

import { useState } from "react";
import { NextPage } from "next";
import RealEstateListing from "./real-estate-listing";

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
