import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { createApi, withToken } from "@pexip/vpaas-api";
import fs from "fs";
import path from "path";

// Read the private key from file
const privateKeyPath = path.join(process.cwd(), "pexip-config/privateKey.pem");
const privateKey = fs.readFileSync(privateKeyPath, "utf8");

// Initialize CORS with full origin including protocol
const cors = Cors({
  origin: "http://localhost:3000", // Ensure the full URL is specified
  methods: ["POST"],
});

// Helper function to run middleware in Next.js
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

// Create a JWT token for authenticating with Pexip VPaaS.
const createJwt = (): string => {
  const apiAddress = process.env.PEXIP_API_ADDRESS!;
  const authEndpoint = `${apiAddress}/oauth/token`;
  const clientId = process.env.PEXIP_CLIENT_ID!;

  const scope = [
    "meeting:create",
    "meeting:read",
    "meeting:write",
    "participant:create",
    "participant:read",
    "participant:write",
  ];
  const requestId = uuidv4();

  const token = jwt.sign(
    {
      iss: clientId,
      sub: clientId,
      aud: authEndpoint,
      scope: scope.join(" "),
    },
    privateKey,
    {
      algorithm: "RS384",
      expiresIn: "60s", // Adjust if necessary
      jwtid: requestId,
    }
  );

  return token;
};

// Create the VPaaS API instance with authentication
const api = withToken(createJwt, process.env.PEXIP_API_ADDRESS!)(createApi());

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run CORS middleware first
  await runMiddleware(req, res, cors);

  if (req.method === "POST") {
    try {
      // Ensure you're calling the correct API endpoint to create a meeting
      const response = await api.create(); // Check if `createMeeting` or similar exists

      if (response.status === 200) {
        // Assuming response.data includes the meeting id (or other useful data)
        const meetingUrl = `/room/${response.data.id}`; // Construct the meeting URL
        return res.status(200).json({ meetingUrl }); // Return the URL to the frontend
      } else {
        // Log the status and response body for debugging
        console.error("Failed to create meeting, status:", response.status);
        console.error("Response body:", response.data);
        return res.status(response.status).json({ message: "Cannot create the meeting", response: response.data });
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      // Log more detailed error information if available
      if (error instanceof Error) {
        return res.status(500).json({ message: "Cannot create the meeting", error: error.message });
      } else {
        return res.status(500).json({ message: "Cannot create the meeting", error: String(error) });
      }
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
