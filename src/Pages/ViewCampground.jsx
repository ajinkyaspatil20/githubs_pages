import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Edit,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axiosInstance from "@/api/axiosInstance";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function ViewCampground() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campground, setCampground] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 1, content: "" });
  const [sortOption, setSortOption] = useState("default");

  useEffect(() => {
    const fetchCampground = async () => {
      try {
        const response = await axiosInstance.get(`/campgrounds/${id}`);
        console.log("Campground data:", response.data);
        console.log("Campground author:", response.data.author);
        setCampground(response.data);
        setReviews(response.data.reviews || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching campground:", error);
        toast({
          title: "Error",
          description: "Failed to load campground details",
          variant: "destructive",
        });
        navigate("/campgrounds");
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axiosInstance.get("/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Current user:", response.data);
          setCurrentUser(response.data);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCampground();
    fetchCurrentUser();
  }, [id, navigate]); // Removed toast from dependencies as it's not needed

  useEffect(() => {
    if (campground && campground.geometry) {
      const mapboxToken =
        "pk.eyJ1Ijoic3VzaGFudDMwIiwiYSI6ImNtMjdkMzlidjBwc3IyaXM5bzVnNmJseTQifQ.BhnxquY7YYUV85E7XT-xOg";
      mapboxgl.accessToken = mapboxToken;

      const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        center: campground.geometry.coordinates,
        zoom: 10,
      });

      // Add marker
      new mapboxgl.Marker()
        .setLngLat(campground.geometry.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h3>${campground.title}</h3><p>${campground.location}</p>`
          )
        )
        .addTo(map);

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl());

      return () => map.remove();
    }
  }, [campground]);

  const handleNextImage = () => {
    if (campground && campground.images.length > 0) {
      setActiveImageIndex((prevIndex) =>
        prevIndex === campground.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (campground && campground.images.length > 0) {
      setActiveImageIndex((prevIndex) =>
        prevIndex === 0 ? campground.images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleDeleteCampground = async () => {
    if (window.confirm("Are you sure you want to delete this campground?")) {
      try {
        await axiosInstance.delete(`/campgrounds/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        toast({
          title: "Success",
          description: "Campground deleted successfully",
        });
        navigate("/campgrounds");
      } catch (error) {
        console.error("Error deleting campground:", error);
        toast({
          title: "Error",
          description: "Failed to delete campground",
          variant: "destructive",
        });
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(
        `/campgrounds/${id}/reviews`,
        { review: newReview },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setReviews([...reviews, response.data]);
      setNewReview({ rating: 1, content: "" });
      toast({
        title: "Success",
        description: "Review submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await axiosInstance.delete(`/campgrounds/${id}/reviews/${reviewId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setReviews(reviews.filter((review) => review._id !== reviewId));
        toast({
          title: "Success",
          description: "Review deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting review:", error);
        toast({
          title: "Error",
          description: "Failed to delete review",
          variant: "destructive",
        });
      }
    }
  };

  const handleSortReviews = (option) => {
    setSortOption(option);
    let sortedReviews = [...reviews];
    if (option === "ascending") {
      sortedReviews.sort((a, b) => a.rating - b.rating);
    } else if (option === "descending") {
      sortedReviews.sort((a, b) => b.rating - a.rating);
    }
    setReviews(sortedReviews);
  };

  const handleApproveRevoke = async (action) => {
    try {
      await axiosInstance.post(
        `/campgrounds/${id}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update the campground status locally
      setCampground({
        ...campground,
        approved: action === "approve",
      });

      toast({
        title: "Success",
        description: `Campground ${
          action === "approve" ? "approved" : "revoked"
        } successfully`,
      });
    } catch (error) {
      console.error(`Error ${action}ing campground:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} campground`,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 pt-20 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!campground) {
    return (
      <div className="container mx-auto p-6 pt-20 text-center">
        <h2 className="text-2xl font-bold">Campground not found</h2>
        <Button onClick={() => navigate("/campgrounds")} className="mt-4">
          Back to Campgrounds
        </Button>
      </div>
    );
  }

  const isAuthor =
    currentUser &&
    campground.author &&
    (currentUser._id === campground.author._id ||
      currentUser.id === campground.author._id ||
      currentUser._id === campground.author.id);
  const isAdmin = currentUser && currentUser.isAdmin;

  return (
    <div className="container mx-auto p-6 pt-20">
      <Toaster />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Campground Details */}
        <div>
          {/* Image Carousel */}
          <div className="relative rounded-xl overflow-hidden h-96 mb-6 bg-gray-200">
            {campground.images && campground.images.length > 0 ? (
              <>
                <img
                  src={campground.images[activeImageIndex].url}
                  alt={campground.title}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
                {campground.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No images available</p>
              </div>
            )}
          </div>

          {/* Campground Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold mb-2">{campground.title}</h1>
            <p className="text-gray-700 mb-4 whitespace-pre-line">
              {campground.description}
            </p>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{campground.location}</span>
            </div>
            <div className="flex items-center text-gray-600 mb-2">
              <span className="font-semibold">Submitted by:</span>
              <span className="ml-2">
                {campground.author?.username || "Unknown"}
              </span>
            </div>
            <div className="text-xl font-bold text-green-600 mb-4">
              ₹{campground.price}/night
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                onClick={() => navigate("/campgrounds")}
                variant="outline"
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>

              {isAuthor && (
                <>
                  <Button
                    onClick={() => navigate(`/campgrounds/${id}/edit`)}
                    variant="outline"
                    className="flex items-center text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    onClick={handleDeleteCampground}
                    variant="outline"
                    className="flex items-center text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </>
              )}

              {isAdmin && (
                <Button
                  onClick={() =>
                    handleApproveRevoke(
                      campground.approved ? "revoke" : "approve"
                    )
                  }
                  variant={campground.approved ? "destructive" : "default"}
                  className="flex items-center"
                >
                  {campground.approved ? "Revoke" : "Approve"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Map and Reviews */}
        <div>
          {/* Map */}
          <div
            id="map"
            className="h-64 rounded-xl mb-6 bg-gray-200"
            style={{ minHeight: "300px" }}
          ></div>

          {/* Reviews Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>

            {/* Add Review Form */}
            {currentUser &&
              (!campground.author ||
                (currentUser._id !== campground.author._id &&
                  currentUser.id !== campground.author._id &&
                  currentUser._id !== campground.author.id)) && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Leave a Review</h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Rating
                      </label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              setNewReview({ ...newReview, rating: star })
                            }
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= newReview.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="review-content"
                        className="block text-sm font-medium mb-1"
                      >
                        Your Review
                      </label>
                      <textarea
                        id="review-content"
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newReview.content}
                        onChange={(e) =>
                          setNewReview({
                            ...newReview,
                            content: e.target.value,
                          })
                        }
                        required
                      ></textarea>
                    </div>
                    <Button type="submit" className="w-full">
                      Submit Review
                    </Button>
                  </form>
                </div>
              )}

            {/* Sort Reviews */}
            {reviews.length > 0 && (
              <div className="mb-4">
                <label
                  htmlFor="sort-reviews"
                  className="block text-sm font-medium mb-1"
                >
                  Sort by Rating
                </label>
                <select
                  id="sort-reviews"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortOption}
                  onChange={(e) => handleSortReviews(e.target.value)}
                >
                  <option value="default">Default</option>
                  <option value="ascending">Lowest to Highest</option>
                  <option value="descending">Highest to Lowest</option>
                </select>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review._id}
                    className="border border-gray-200 rounded-lg p-4"
                    data-rating={review.rating}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">
                        {review.author?.username || "Anonymous"}
                      </h4>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-gray-700">{review.content}</p>
                    {currentUser &&
                      review.author &&
                      (currentUser._id === review.author._id ||
                        currentUser.id === review.author._id ||
                        currentUser._id === review.author.id) && (
                        <Button
                          onClick={() => handleDeleteReview(review._id)}
                          variant="outline"
                          size="sm"
                          className="mt-2 text-red-600 border-red-600 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">
                  No reviews yet. Be the first to leave a review!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
