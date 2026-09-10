import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastProvider } from "./components/Toast";
import Landing from "./pages/Landing";
import Analyze from "./pages/Analyze";
import Results from "./pages/Results";
import History from "./pages/History";
import Simulator from "./pages/Simulator";
import Dashboard from "./pages/Dashboard";
import Learn from "./pages/Learn";
import About from "./pages/About";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/results" element={<Results />} />
            <Route path="/history" element={<History />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
