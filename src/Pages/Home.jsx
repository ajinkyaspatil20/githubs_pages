import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { MapPin, PlusCircle, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Home = () => {
  const [campgrounds, setCampgrounds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCampgrounds = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/campgrounds");
        setCampgrounds(response.data);
      } catch (error) {
        console.error("Error fetching campgrounds:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampgrounds();
  }, []);

  return (
    <div className="container mx-auto p-6 pt-20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Discover Campgrounds
        </h1>
        <Link
          to="/campgrounds/new"
          className="mt-4 md:mt-0 flex items-center bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg shadow-md transition-all"
        >
          <PlusCircle className="w-6 h-6 mr-2" />
          Add Campground
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {campgrounds
          .filter((campground) => campground.approved)
          .map((campground) => (
            <div
              className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
              key={campground._id}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  alt={campground.title}
                  src={
                    campground.images.length
                      ? campground.images[0].url
                      : "https://res.cloudinary.com/sushanttulasi/image/upload/v1717844643/CampQuest/r8ltrfojrdl5t45jqnps.jpg"
                  }
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2 truncate">
                  {campground.title}
                </h2>
                <p className="text-gray-700 mb-4 line-clamp-3 flex-1">
                  {campground.description}
                </p>
                <div className="flex items-center text-gray-500 mb-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span className="text-sm truncate">
                    {campground.location}
                  </span>
                </div>
                <Link
                  className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow-md transition-all w-full"
                  to={`/campgrounds/${campground._id}`}
                >
                  <Eye className="w-5 h-5 mr-2" />
                  View Details
                </Link>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Home;
