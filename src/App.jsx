import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./Pages/Home";
import Landing from "./Pages/Landing";
import Login from "./Pages/auth/Login";
import Register from "./Pages/auth/Register";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoadingProvider } from "./context/LoadingContext";
import NewCampground from "./Pages/NewCampground";
import ViewCampground from "./Pages/ViewCampground";
import EditCampground from "./Pages/EditCampground";

function App() {
  return (
    <LoadingProvider>
      <Router basename="/github_pages">
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route index path="/" element={<Landing />} />
          <Route path="/" element={<Layout />}>
            <Route path="/campgrounds" element={<Home />} />
            <Route path="/campgrounds/new" element={<NewCampground />} />
            <Route path="/campgrounds/:id" element={<ViewCampground />} />
            <Route path="/campgrounds/:id/edit" element={<EditCampground />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LoadingProvider>
  );
}

export default App;
