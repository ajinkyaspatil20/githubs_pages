import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    const adminStatus = localStorage.getItem("isAdmin");
    setIsAuthenticated(authStatus === "true");
    setIsAdmin(adminStatus === "true");
  }, [location]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-gray-700 shadow-lg fixed w-full z-50">
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
              ...(!isAuthenticated
                ? [
                    { name: "Register", path: "/register" },
                    { name: "Login", path: "/login" },
                  ]
                : [
                    {
                      name: "New Campground",
                      path: "/new",
                      show: location.pathname !== "/",
                    },
                    {
                      name: "Logout",
                      path: "#",
                      onClick: () => {
                        localStorage.clear();
                        setIsAuthenticated(false);
                        setIsAdmin(false);
                        navigate("/");
                      },
                    },
                  ]),
            ]
              .flat()
              .map(
                (item) =>
                  (item.show === undefined || item.show) && (
                    <li className="nav-item relative" key={item.path}>
                      <a
                        className="nav-link text-white hover:text-gray-300 transition-all duration-300 cursor-pointer px-3 py-2 relative"
                        href={item.path}
                        onClick={item.onClick}
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

export default Navbar;
