import { toast } from "sonner";
  
export const uploadImage = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", 'you-Ocean');
    data.append("cloud_name", "dzvdh7yez");
    try {
        const response = await fetch('https://api.cloudinary.com/v1_1/dzvdh7yez/image/upload', {
          method: "POST",
          body: data,
        });
    
      const result = await response.json();
      toast.success("Image uploaded successfully!");
      return result.secure_url;
      
    } catch (error) {
        console.error("Image upload failed:", error);
        toast.error("Image upload failed. Please try again.");
        return null;
    }
  };
  