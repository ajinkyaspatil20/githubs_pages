import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Upload, X } from "lucide-react";

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

export default function NewCampgroundPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [image, setImage] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      location: "",
      description: "",
      price: "",
    },
    mode: "onChange",
  });

  const handleImageChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);
    setImage((prev) => [...prev, ...newFiles]);

    // Generate previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previews[index]);

    setImage(image.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  async function onSubmit(values) {
    if (image.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one image",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      const formData = new FormData();

      // Append form values
      Object.entries(values).forEach(([key, value]) => {
        formData.append(`campground[${key}]`, value);
      });

      // Append images
      image.forEach((image) => {
        formData.append("image", image);
      });

      const response = await axiosInstance.post("/campgrounds", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      //console.log(localStorage.getItem("token"));
      toast({
        title: "Success!",
        description: "Your campground has been created",
      });

      navigate("/campgrounds");
    } catch (error) {
      console.error("Error creating campground:", error);
      toast({
        title: "Error",
        description: "Failed to create campground. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  }

  return (
    <div
      className="container mx-auto pt-20 px-4 md:px-6"
      style={{ height: "94vh" }}
    >
      <Toaster />
      <div className="max-w-4xl mx-auto h-[80vh] bg-white rounded-lg shadow-2xl border border-black">
        <Card className="border-none shadow-lg h-full flex flex-col">
          <CardHeader className="bg-primary/5 rounded-t-lg flex-shrink-0">
            <CardTitle className="text-4xl font-bold mb-2">
              Create New Campground
            </CardTitle>
            <CardDescription className="text-lg">
              Fill in the details below to add your campground
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-grow overflow-y-auto p-8">
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

                <div className="space-y-4">
                  <FormLabel className="block text-xl font-semibold">
                    Images
                  </FormLabel>
                  <div className="flex items-center gap-4">
                    <label
                      htmlFor="image"
                      className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-lg"
                    >
                      <Upload className="h-6 w-6 text-gray-500" />
                      <span>Upload Photos</span>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="text-base text-gray-500">
                      {image.length} {image.length === 1 ? "file" : "files"}{" "}
                      selected
                    </p>
                  </div>

                  {previews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                      {previews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="h-32 w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {previews.length === 0 && (
                    <p className="text-base text-gray-500 italic">
                      Please upload at least one image of the campground
                    </p>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-between p-6 border-t flex-shrink-0">
            <div className="flex w-full justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/campgrounds")}
                className="text-lg px-6 py-5"
              >
                Cancel
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
                    Creating...
                  </>
                ) : (
                  "Create Campground"
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
