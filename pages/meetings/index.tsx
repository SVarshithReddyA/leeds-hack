<<<<<<< HEAD
import { useEffect, useRef, useState } from "react";
import * as backend from "@pexip/vpaas-api";
import * as sdk from "@pexip/vpaas-sdk";
import * as jose from "jose";

const Meeting = () => {
  const [meetingId, setMeetingId] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [participantSecret, setParticipantSecret] = useState("");
  const [isMeetingStarted, setIsMeetingStarted] = useState(false);
  const gridRef = useRef(null); // Store grid reference
  const CLIENT_SECRET = process.env.NEXT_PUBLIC_CLIENT_SECRET;
  const CRUD_ADDRESS = process.env.NEXT_PUBLIC_CRUD_ADDRESS;
  const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
  const ALGORITHM = "RS384";
  const SCOPES = [
    "meeting:create",
    "meeting:read",
    "meeting:write",
    "participant:create",
    "participant:read",
    "participant:write",
  ];
  const RECV_AUDIO_COUNT = 9;
  const RECV_VIDEO_COUNT = 9;

  console.log("API Address:", CRUD_ADDRESS); // Debugging

  const createAndSignJWT = async () => {
    const now = Math.floor(Date.now() / 1000);
    const PRIVATE_KEY = await jose.importPKCS8(CLIENT_SECRET, ALGORITHM);

    return new jose.SignJWT({
      iss: CLIENT_ID,
      sub: CLIENT_ID,
      aud: `${CRUD_ADDRESS}/oauth/token`,
      exp: now + 60,
      nbf: now - 30,
      iat: now,
      jti: crypto.randomUUID(),
      scope: SCOPES.join(" "),
    })
      .setProtectedHeader({ alg: ALGORITHM })
      .sign(PRIVATE_KEY);
  };

  const joinMeeting = async () => {
    try {
      const api = backend.createApi();
      const token = await createAndSignJWT();
      const { data } = await api.token({ apiAddress: CRUD_ADDRESS, token });

      const accessToken = `${data?.token_type} ${data?.access_token}`;
      let meetingIdFromURL = meetingId || new URLSearchParams(window.location.search).get("id");

      if (!meetingIdFromURL) {
        const res = await api.create({ apiAddress: CRUD_ADDRESS, accessToken });
        meetingIdFromURL = res.data.id;
        setMeetingId(meetingIdFromURL);
        //history.pushState(null, "null", window.location.pathname + `?id=${meetingIdFromURL}`);
      }

      const { data: participantData } = await api.participants({
        accessToken,
        apiAddress: CRUD_ADDRESS,
        meetingId: meetingIdFromURL,
      });

      // Check if participantData is an object
      if (participantData && typeof participantData === "object") {
        setParticipantId(participantData.id);
        setParticipantSecret(participantData.participant_secret);
      } else {
        console.error("Unexpected participant data format:", participantData);
      }

      console.log("Meeting ID:", meetingIdFromURL);
      console.log("Participant ID:", participantData.id);
    } catch (error) {
      console.error("Error joining meeting:", error);
    }
  };

  const setupVpaas = async () => {
    const vpaasSignals = sdk.createVpaasSignals();
    const vpaas = sdk.createVpaas({ vpaasSignals, config: {} });

    await vpaas.joinMeeting({
      apiAddress: CRUD_ADDRESS,
      participantId,
      participantSecret,
      meetingId,
    });

    // Get local media stream
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    // Attach local stream to a new video element
    let localVideo = document.getElementById("local-video");
    if (!localVideo) {
      localVideo = document.createElement("video");
      localVideo.id = "local-video";
      localVideo.autoplay = true;
      localVideo.muted = true; // Avoid echo
      localVideo.style = "width: 100%; border: 2px solid green;";
      grid.appendChild(localVideo);
    }
    localVideo.srcObject = stream;

    await vpaas.connect({
      get mediaInits() {
        const [audioTrack] = stream?.getAudioTracks() ?? [];
        const [videoTrack] = stream?.getVideoTracks() ?? [];
        return [
          {
            content: "main",
            direction: "sendonly",
            kindOrTrack: audioTrack ?? "audio",
            streams: stream && audioTrack ? [stream] : [],
          },
          {
            content: "main",
            direction: "sendonly",
            kindOrTrack: videoTrack ?? "video",
            streams: stream && videoTrack ? [stream] : [],
          },
          ...sdk.createRecvTransceivers("audio", RECV_AUDIO_COUNT),
          ...sdk.createRecvTransceivers("video", RECV_VIDEO_COUNT),
        ];
      },
    });

    vpaasSignals.onRemoteStreams.add((transceiverConfig) => {
      const elemID = `remote-${transceiverConfig.kind}-mid-${transceiverConfig.transceiver.mid}`;
      let el = document.getElementById(elemID);
      if (!el) {
        el = document.createElement(transceiverConfig.kind);
        el.id = elemID;
        grid.appendChild(el);
      }

      el.srcObject = transceiverConfig.remoteStreams[0];
      el.style = "width: 100%;";
      el.play();
    });
  };

  const handleStartMeeting = async () => {
    await joinMeeting();
    setIsMeetingStarted(true);
  };

  useEffect(() => {
    if (isMeetingStarted && participantId && participantSecret) {
      setupVpaas();
    }
  }, [isMeetingStarted, participantId, participantSecret]);

  return (
    <div>
      <h1>VPaaS Meeting</h1>
      <button onClick={handleStartMeeting}>Start Meeting</button>
      <div
        id="grid"
        ref={gridRef}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr 1fr 1fr" }}
      ></div>
    </div>
  );
};

export default Meeting;
=======
import { useRouter } from "next/router";
import { useState } from "react";

export default function MeetingsIndex() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const createMeeting = async (): Promise<void> => {
    setLoading(true);
    try {
      // Make sure NEXT_PUBLIC_SERVER_URL is set (e.g. http://localhost:3000)
      const response = await fetch(`/api/create-meeting`, {
        method: "POST",
      });
      const data = await response.json();

      // Check if the backend returned the meeting URL
      if (data.meetingUrl) {
        // Redirect to the meeting URL
        router.push(data.meetingUrl);
      } else {
        console.error("Meeting creation failed:", data.message);
      }
    } catch (e) {
      console.error("Cannot create the meeting", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="meeting-container" style={{ padding: "20px", textAlign: "center" }}>
      <h1>Decentralized Meeting Room</h1>
      <button
        onClick={createMeeting}
        disabled={loading}
        style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "#fff", border: "none", cursor: "pointer" }}
      >
        {loading ? "Creating..." : "Create Meeting"}
      </button>
    </div>
  );
}
>>>>>>> 4aa0daf568a83e2bbd0d934ec1e5366a6775e684
