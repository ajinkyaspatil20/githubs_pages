import React from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
//import homeBg from "@/assets/homeBg.jpg";

function Landing() {
  return (
    <div
      className="w-full h-screen flex flex-col justify-between text-center text-white relative"
      style={{
        backgroundColor: "#1a365d",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-0"></div>{" "}
      {/* Navbar - Fixed at the top with highest z-index */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>
      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-grow pt-24 px-6 z-10">
        <h1 className="text-3xl font-semibold drop-shadow-lg">CampQuest</h1>
        <p className="text-lg mt-4 max-w-2xl font-thin drop-shadow-md">
          Welcome to CampQuest Adventures! <br />
          Dive into the excitement and discover our diverse campgrounds. <br />
          Don't hesitate to share your own experiences and engage with the
          community!
        </p>
        <a
          href="/campgrounds"
          className="mt-6 px-4 text-xl py-3 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition"
        >
          View Campgrounds
        </a>
      </main>
      {/* Footer - Fixed at the bottom with higher z-index */}
      <div className="fixed bottom-0 left-0 w-full z-20">
        <Footer />
      </div>
    </div>
  );
}

export default Landing;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-transparent shadow-lg fixed w-full z-50">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <a className="text-2xl font-semibold tracking-wide text-white" href="/">
          CampQuest
        </a>
        <button
          className="lg:hidden p-2 border-2 rounded-md text-white"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <span className="block w-6 h-0.5 bg-white mb-2"></span>
          <span className="block w-6 h-0.5 bg-white mb-2"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
        </button>
        <div
          className={`lg:flex flex-col lg:flex-row lg:space-x-6 mt-4 lg:mt-0 ${
            isOpen ? "block" : "hidden"
          }`}
        >
          <ul className="navbar-nav flex flex-col lg:flex-row gap-6 relative">
            {[
              { name: "Home", path: "/" },
              { name: "Campgrounds", path: "/campgrounds" },
              { name: "Register", path: "/register" },
              {
                name: "New Campground",
                path: "/new",
                show: location.pathname !== "/",
              },
              { name: "Login", path: "/login" },
            ].map(
              (item) =>
                (item.show === undefined || item.show) && (
                  <li className="nav-item relative" key={item.path}>
                    <a
                      className="nav-link text-white hover:text-gray-300 transition-all duration-300 cursor-pointer px-3 py-2 relative"
                      href={item.path}
                    >
                      {item.name}
                      {location.pathname === item.path && (
                        <div className="absolute left-0 bottom-0 w-full h-1 bg-white rounded-lg transition-all duration-300"></div>
                      )}
                    </a>
                  </li>
                )
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="bg-light text-center text-lg-start mt-auto">
      <div
        className="text-center p-3 text-gray-400 text-md"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
      >
        © 2025 CampQuest. All rights reserved.
      </div>
    </footer>
  );
};
