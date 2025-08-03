import { Routes, Route } from "react-router-dom";
import PusherChatPage from "./pages/PusherChatPage";
import NotFoundPage from "./pages/NotFoundPage";
import VendorsPage from "./pages/VendorsPage";
import AddVendorPage from "./pages/AddVendorPage";
import BotConfigPage from "./pages/BotConfigPage";
import Navigation from "./components/Navigation";
import "./App.css";

function App() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<PusherChatPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/vendors/add" element={<AddVendorPage />} />
        <Route path="/bot-config" element={<BotConfigPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
