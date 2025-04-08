import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MapPin, Eye, CheckCircle, XCircle } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function AdminCampgrounds() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campgrounds, setCampgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axiosInstance.get("/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setCurrentUser(response.data);

          // If user is not an admin, redirect to home
          if (!response.data.isAdmin) {
            toast({
              title: "Access Denied",
              description: "You don't have permission to access this page",
              variant: "destructive",
            });
            navigate("/campgrounds");
          }
        } else {
          // No token, redirect to login
          toast({
            title: "Authentication Required",
            description: "Please log in to access this page",
            variant: "destructive",
          });
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        navigate("/login");
      }
    };

    const fetchAllCampgrounds = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axiosInstance.get("/admin/campgrounds", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCampgrounds(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching campgrounds:", error);
        toast({
          title: "Error",
          description: "Failed to load campgrounds",
          variant: "destructive",
        });
      }
    };

    fetchCurrentUser();
    fetchAllCampgrounds();
  }, [navigate, toast]);

  useEffect(() => {
    if (!loading && campgrounds.length > 0) {
      const mapboxToken =
        "pk.eyJ1Ijoic3VzaGFudDMwIiwiYSI6ImNtMjdkMzlidjBwc3IyaXM5bzVnNmJseTQifQ.BhnxquY7YYUV85E7XT-xOg";
      mapboxgl.accessToken = mapboxToken;

      const map = new mapboxgl.Map({
        container: "cluster-map",
        style: "mapbox://styles/mapbox/light-v10",
        center: [78.9629, 20.5937], // Center of India
        zoom: 3,
      });

      map.addControl(new mapboxgl.NavigationControl());

      map.on("load", () => {
        // Add a new source from our GeoJSON data
        map.addSource("campgrounds", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: campgrounds
              .filter((campground) => campground.geometry)
              .map((campground) => ({
                type: "Feature",
                geometry: campground.geometry,
                properties: {
                  id: campground._id,
                  title: campground.title,
                  description: campground.description,
                  approved: campground.approved,
                },
              })),
          },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        // Add cluster circles
        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "campgrounds",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#51bbd6",
              10,
              "#f1f075",
              30,
              "#f28cb1",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              10,
              30,
              30,
              40,
            ],
          },
        });

        // Add cluster count text
        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "campgrounds",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
          paint: {
            "text-color": "#ffffff",
          },
        });

        // Add unclustered point markers
        map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "campgrounds",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": [
              "case",
              ["get", "approved"],
              "#11b981", // Green for approved
              "#ef4444", // Red for unapproved
            ],
            "circle-radius": 8,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff",
          },
        });

        // Add click event for clusters
        map.on("click", "clusters", (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
          });
          const clusterId = features[0].properties.cluster_id;
          map
            .getSource("campgrounds")
            .getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err) return;

              map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom,
              });
            });
        });

        // Add click event for unclustered points
        map.on("click", "unclustered-point", (e) => {
          const { id, title } = e.features[0].properties;
          const coordinates = e.features[0].geometry.coordinates.slice();

          // Create popup
          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(
              `<strong><a href="/campgrounds/${id}">${title}</a></strong>`
            )
            .addTo(map);
        });

        // Change cursor on hover
        map.on("mouseenter", "clusters", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "clusters", () => {
          map.getCanvas().style.cursor = "";
        });
        map.on("mouseenter", "unclustered-point", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "unclustered-point", () => {
          map.getCanvas().style.cursor = "";
        });
      });

      return () => map.remove();
    }
  }, [loading, campgrounds]);

  const handleApproveCampground = async (id) => {
    try {
      await axiosInstance.post(
        `/campgrounds/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update campground status locally
      setCampgrounds(
        campgrounds.map((camp) =>
          camp._id === id ? { ...camp, approved: true } : camp
        )
      );

      toast({
        title: "Success",
        description: "Campground approved successfully",
      });
    } catch (error) {
      console.error("Error approving campground:", error);
      toast({
        title: "Error",
        description: "Failed to approve campground",
        variant: "destructive",
      });
    }
  };

  const handleRevokeCampground = async (id) => {
    try {
      await axiosInstance.post(
        `/campgrounds/${id}/revoke`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update campground status locally
      setCampgrounds(
        campgrounds.map((camp) =>
          camp._id === id ? { ...camp, approved: false } : camp
        )
      );

      toast({
        title: "Success",
        description: "Campground revoked successfully",
      });
    } catch (error) {
      console.error("Error revoking campground:", error);
      toast({
        title: "Error",
        description: "Failed to revoke campground",
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

  return (
    <div className="container mx-auto p-6 pt-20">
      <Toaster />

      {/* Map */}
      <div
        id="cluster-map"
        className="w-full h-96 rounded-xl mb-8 bg-gray-200"
      ></div>

      {/* Analytics Button */}
      <div className="mb-8">
        <a
          href="https://app.powerbi.com/reportEmbed?reportId=bd53bc37-3032-49fa-82ca-5ed6ba4a7e19&autoAuth=true&ctid=cca3f0fe-586f-4426-a8bd-b8146307e738"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg">
            Go to Analytics
          </Button>
        </a>
      </div>

      <h1 className="text-4xl font-bold mb-8">All Campgrounds</h1>

      <div className="space-y-6">
        {campgrounds.map((campground) => (
          <div
            key={campground._id}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="md:flex">
              <div className="md:w-1/3 h-64 md:h-auto">
                <img
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                  alt={campground.title}
                  src={
                    campground.images && campground.images.length
                      ? campground.images[0].url
                      : "https://res.cloudinary.com/sushanttulasi/image/upload/v1717844643/CampQuest/r8ltrfojrdl5t45jqnps.jpg"
                  }
                />
              </div>
              <div className="md:w-2/3 p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold mb-2">
                    {campground.title}
                  </h2>
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        campground.approved
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {campground.approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {campground.description}
                </p>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{campground.location}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to={`/campgrounds/${campground._id}`}>
                    <Button variant="outline" className="flex items-center">
                      <Eye className="h-4 w-4 mr-2" /> View Details
                    </Button>
                  </Link>

                  {campground.approved ? (
                    <Button
                      variant="outline"
                      className="flex items-center text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleRevokeCampground(campground._id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" /> Revoke
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="flex items-center text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => handleApproveCampground(campground._id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> Approve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
