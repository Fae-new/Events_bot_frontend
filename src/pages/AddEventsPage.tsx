import { useState } from "react";
import axios from "axios";
import EventCenterForm from "./AddEventsForm";
import { SOCKET_SERVER_URL } from "./ChatPage";

const AddEventCenterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (formData: any) => {
    console.log(formData);
    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        SOCKET_SERVER_URL + "/admin/event-centers",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (response.status === 200) {
        setMessage("Event center added successfully!");
        // Optionally redirect or reset form
      } else {
        setMessage(`Error: ${response.data.error}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(`Error: ${error.response.data?.error || error.message}`);
      } else {
        setMessage("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto">
        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.includes("Error")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}
        <EventCenterForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default AddEventCenterPage;
