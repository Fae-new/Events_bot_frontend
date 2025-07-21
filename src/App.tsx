import { Routes, Route } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";
import "./App.css";
import AddEventCenterPage from "./pages/AddEventsPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/event-form" element={<AddEventCenterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
