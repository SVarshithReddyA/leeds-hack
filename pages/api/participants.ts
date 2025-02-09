// pages/pexip-api/participants.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createApi, withToken } from "@pexip/vpaas-api";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

// Reuse the createJwt function logic here (or import it if you export it from a common module)
const createJwt = (): string => {
  const apiAddress = process.env.PEXIP_API_ADDRESS!;
  const authEndpoint = `${apiAddress}/oauth/token`;
  const clientId = process.env.PEXIP_CLIENT_ID!;
  const privateKey = process.env.PEXIP_PRIVATE_KEY!;

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
      expiresIn: "60s",
      jwtid: requestId,
    }
  );

  return token;
};

const api = withToken(createJwt, process.env.PEXIP_API_ADDRESS!)(createApi());

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      // Assume the meeting ID is provided as a query parameter, e.g., /pexip-api/participants?meetingId=...
      const meetingId = req.query.meetingId as string;
      if (!meetingId) {
        return res.status(400).json({ message: "Missing meetingId parameter" });
      }

      const response = await api.participants({ meetingId });
      if (response.status === 200) {
        return res.status(200).json(response.data);
      } else {
        return res.status(500).json({ message: "Cannot get participants for the meeting" });
      }
    } catch (error) {
      console.error("Error getting participants:", error);
      return res.status(500).json({ message: "Cannot get participants for the meeting" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
