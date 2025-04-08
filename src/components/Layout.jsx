import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Fixed Transparent Navbar */}
      <Navbar />

      {/* Main Content - No scrolling issue */}
      <main className="flex-grow-1 pt-[-20px] d-flex justify-content-center align-items-center">
        <Outlet />
      </main>

      {/* Footer stays at the bottom */}
      <Footer />
    </div>
  );
};

export default Layout;
