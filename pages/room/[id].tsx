import { useRouter } from "next/router";

export default function Meeting() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) {
    return <p>Loading...</p>;
  }

  return (
    <div className="meeting-container" style={{ padding: "20px", textAlign: "center" }}>
      <h1>Meeting ID: {id}</h1>
      {/* You can use this id to fetch meeting details or render video */}
      <iframe
        src={`localhost:3000/room/${id}`} // Adjust this URL for your actual video service
        width="800"
        height="600"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        style={{ border: "1px solid #ccc" }}
      ></iframe>
    </div>
  );
}
