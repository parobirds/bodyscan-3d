import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Home from "@/pages/Home";
import Scan from "@/pages/Scan";
import Model from "@/pages/Model";
import Report from "@/pages/Report";

export default function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/model" element={<Model />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </Router>
  );
}
