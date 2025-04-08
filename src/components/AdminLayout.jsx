import { useState, useEffect } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import axiosInstance from "@/api/axiosInstance";
import { LayoutDashboard, Tent, Users, LogOut } from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast({
            title: "Authentication Required",
            description: "Please log in to access the admin panel",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        const response = await axiosInstance.get("/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.data.isAdmin) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin panel",
            variant: "destructive",
          });
          navigate("/campgrounds");
          return;
        }

        setCurrentUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  const handleLogout = async () => {
    try {
      await axiosInstance.get("/logout");
      localStorage.removeItem("token");
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Toaster />

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">Admin Panel</h1>
          <p className="text-gray-600 mt-1">Welcome, {currentUser.username}</p>
        </div>

        <nav className="mt-6">
          <ul>
            <li>
              <Link
                to="/admin"
                className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/admin/campgrounds"
                className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                <Tent className="h-5 w-5 mr-3" />
                Campgrounds
              </Link>
            </li>
            <li>
              <Link
                to="/admin/users"
                className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                <Users className="h-5 w-5 mr-3" />
                Users
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
