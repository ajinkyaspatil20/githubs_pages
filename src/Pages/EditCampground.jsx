import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Upload, X, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import axiosInstance from "@/api/axiosInstance";

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  location: z.string().min(3, { message: "Location is required" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
});

export default function EditCampground() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [deleteImages, setDeleteImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [campground, setCampground] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: async () => {
      try {
        const response = await axiosInstance.get(`/campgrounds/${id}`);
        const campgroundData = response.data;
        return {
          title: campgroundData.title,
          location: campgroundData.location,
          description: campgroundData.description,
          price: campgroundData.price.toString(),
        };
      } catch (error) {
        console.error("Error loading campground data:", error);
        return {
          title: "",
          location: "",
          description: "",
          price: "",
        };
      }
    },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchCampground = async () => {
      try {
        const response = await axiosInstance.get(`/campgrounds/${id}`);
        const campgroundData = response.data;
        setCampground(campgroundData);
        setImages(campgroundData.images || []);
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

    fetchCampground();
  }, [id, navigate, toast]);

  const handleNewImageChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...newFiles]);

    // Generate previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(newImagePreviews[index]);

    setNewImages(newImages.filter((_, i) => i !== index));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };

  const toggleDeleteImage = (filename) => {
    if (deleteImages.includes(filename)) {
      setDeleteImages(deleteImages.filter((name) => name !== filename));
    } else {
      setDeleteImages([...deleteImages, filename]);
    }
  };

  async function onSubmit(values) {
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Append form values
      Object.entries(values).forEach(([key, value]) => {
        formData.append(`campground[${key}]`, value);
      });

      // Append new images
      newImages.forEach((image) => {
        formData.append("image", image);
      });

      // Append delete images
      deleteImages.forEach((filename) => {
        formData.append("deleteImages[]", filename);
      });

      await axiosInstance.put(`/campgrounds/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: "Success!",
        description: "Your campground has been updated",
      });

      navigate(`/campgrounds/${id}`);
    } catch (error) {
      console.error("Error updating campground:", error);
      toast({
        title: "Error",
        description: "Failed to update campground. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto pt-20 px-4 md:px-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto pt-20 px-4 md:px-6"
      style={{ minHeight: "94vh" }}
    >
      <Toaster />
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl border border-black">
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-primary/5 rounded-t-lg">
            <CardTitle className="text-4xl font-bold mb-2">
              Edit Campground
            </CardTitle>
            <CardDescription className="text-lg">
              Update the details of your campground
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xl font-semibold">
                        Campground Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Sunset Peak Campsite"
                          {...field}
                          className="text-lg py-6"
                        />
                      </FormControl>
                      <FormDescription className="text-base">
                        Give your campground a descriptive name
                      </FormDescription>
                      <FormMessage className="text-base" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xl font-semibold">
                        Location
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Himachal Pradesh, India"
                          {...field}
                          className="text-lg py-6"
                        />
                      </FormControl>
                      <FormDescription className="text-base">
                        Where is this campground located?
                      </FormDescription>
                      <FormMessage className="text-base" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xl font-semibold">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the campground, its surroundings, and what makes it special..."
                          className="min-h-[150px] text-lg"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription className="text-base">
                        Include details about amenities, views, and nearby
                        attractions
                      </FormDescription>
                      <FormMessage className="text-base" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xl font-semibold">
                        Price per night (₹)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                            ₹
                          </span>
                          <Input
                            className="pl-7 text-lg py-6"
                            placeholder="1000"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-base">
                        Set a reasonable price per night in Indian Rupees
                      </FormDescription>
                      <FormMessage className="text-base" />
                    </FormItem>
                  )}
                />

                {/* Current Images */}
                <div className="space-y-4">
                  <FormLabel className="block text-xl font-semibold">
                    Current Images
                  </FormLabel>
                  {images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img.url}
                            alt={`Campground image ${index + 1}`}
                            className={`h-32 w-full object-cover rounded-md ${
                              deleteImages.includes(img.filename)
                                ? "opacity-50"
                                : ""
                            }`}
                            crossOrigin="anonymous"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <input
                              type="checkbox"
                              id={`delete-${img.filename}`}
                              checked={deleteImages.includes(img.filename)}
                              onChange={() => toggleDeleteImage(img.filename)}
                              className="h-5 w-5"
                            />
                            <label
                              htmlFor={`delete-${img.filename}`}
                              className="ml-2 text-white font-medium drop-shadow-lg"
                            >
                              Delete?
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No current images</p>
                  )}
                </div>

                {/* Add New Images */}
                <div className="space-y-4">
                  <FormLabel className="block text-xl font-semibold">
                    Add New Images
                  </FormLabel>
                  <div className="flex items-center gap-4">
                    <label
                      htmlFor="new-image"
                      className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-lg"
                    >
                      <Upload className="h-6 w-6 text-gray-500" />
                      <span>Upload Photos</span>
                      <Input
                        id="new-image"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleNewImageChange}
                      />
                    </label>
                    <p className="text-base text-gray-500">
                      {newImages.length}{" "}
                      {newImages.length === 1 ? "file" : "files"} selected
                    </p>
                  </div>

                  {newImagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                      {newImagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`New preview ${index + 1}`}
                            className="h-32 w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-between p-6 border-t">
            <div className="flex w-full justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/campgrounds/${id}`)}
                className="text-lg px-6 py-5 flex items-center"
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                onClick={form.handleSubmit(onSubmit)}
                className="text-lg px-8 py-5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Campground"
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
