"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const cards = [
    {
      title: "List Assets",
      description: "Click the button to list your assets.",
      href: "/list-assets",
      action: "List",
    },
    {
      title: "Invest",
      description: "Click the button to invest your money.",
      href: "/invest",
      action: "Invest",
    },
    {
      title: "Request a Loan",
      description: "Click the button to request a loan.",
      href: "/request-loan",
      action: "Request",
    },
    {
      title: "Lend Money",
      description: "Click the button to lend your money.",
      href: "/lend-money",
      action: "Lend",
    },
    {
      title: "Verify Asset Ownership",
      description: "Click the button to verify asset ownership.",
      href: "/verify-ownership",
      action: "Verify",
    },
    {
      title: "Provide Asset Gurantees",
      description: "Click the button to provide asset guarantees.",
      href: "/asset-guarantees",
      action: "Provide",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-10 pt-10 px-20">
        {cards.map((card, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg">
            <h2 className="card-title">{card.title}</h2>
            <p className="">{card.description}</p>
            <Link href={card.href}>
              <button className="btn btn-primary">{card.action}</button>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
};

export default Home;
