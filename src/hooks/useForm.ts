 import { useState, ChangeEvent } from 'react';

export function useForm<T>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "you-Ocean");
      data.append("cloud_name", "dzvdh7yez");   

      try {
        const res = await fetch("https://api.cloudinary.com/v1_1/dzvdh7yez/image/upload", {
          method: "POST",
          body: data,
        });

        const uploadImgURL = await res.json();
        console.log(uploadImgURL.url); 
        return uploadImgURL.secure_url; 
      } catch (error) {
        console.error("Image upload failed:", error);
        return ''; 
      }
    }

    return ''; 
  };

  return {
    formData,
    handleChange,
    handleImageChange,
  };
}
