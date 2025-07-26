import { Routes, Route } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
// import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";
import VendorsPage from "./pages/VendorsPage";
import AddVendorPage from "./pages/AddVendorPage";
import BotConfigPage from "./pages/BotConfigPage";
import Navigation from "./components/Navigation";
import "./App.css";
// import AddEventCenterPage from "./pages/AddEventsPage";

function App() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<ChatPage />} />
        {/* <Route path="/about" element={<AboutPage />} /> */}
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/vendors/add" element={<AddVendorPage />} />
        <Route path="/bot-config" element={<BotConfigPage />} />
        {/* <Route path="/event-form" element={<AddEventCenterPage />} /> */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
