import { sql } from "@vercel/postgres";
import { writeFileSync } from "fs";

export async function POST(request: Request) {
  const reqBody = await request.json();
  console.log({ reqBody });
  // Save req body to a JSON file
  writeFileSync("reqBody.json", JSON.stringify(reqBody));
  return Response.json({ message: "Property listed successfully" }, { status: 201 });
  // try {
  //   // Parse and validate the input data
  //   const { address, price, fractions, photo, description } = reqBody.formData;
  //   const { connectedWalletAddress } = reqBody;

  //   if (!address || !price || !fractions) {
  //     return Response.json(
  //       { message: "Please fill in all required fields." },
  //       {
  //         status: 400,
  //       },
  //     );
  //   }

  //   // Connect to the database
  //   await sql`CREATE TABLE IF NOT EXISTS properties (
  //     id SERIAL PRIMARY KEY,
  //     connected_wallet_address TEXT NOT NULL,
  //     address TEXT NOT NULL,
  //     total_value NUMERIC NOT NULL,
  //     fractions_count INT NOT NULL,
  //     photo TEXT,
  //     description TEXT NOT NULL,
  //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  //   )`;

  //   // Insert the property into the database
  //   const result = await sql`
  //     INSERT INTO properties (connected_wallet_address, address, total_value, fractions_count, photo, description)
  //     VALUES (${connectedWalletAddress}, ${address}, ${price}, ${fractions}, ${photo}, ${description})
  //     RETURNING *
  //   `;

  //   const newProperty = result.rows[0];

  //   return Response.json(
  //     { message: "Property listed successfully", property: newProperty },
  //     {
  //       status: 201,
  //     },
  //   );
  // } catch (error) {
  //   console.error(error);
  //   return Response.json(
  //     { message: "Internal server error" },
  //     {
  //       status: 500,
  //     },
  //   );
  // }
}
