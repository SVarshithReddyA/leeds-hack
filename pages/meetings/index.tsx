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
