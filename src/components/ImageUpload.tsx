import React, { useState } from "react";
import { Upload, User, Loader } from "lucide-react";

interface ImageUploadProps {
  previewUrl: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageUpload({ previewUrl, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true); 
    await onChange(e); 
    setIsUploading(false); 
  };

  return (
    <div className="flex flex-col items-center my-4">
      <div className="relative w-24 h-24 mb-4">
        {isUploading ? (
          <div className="w-full h-full flex items-center justify-center rounded-full bg-gray-100">
            <Loader className="w-12 h-12 animate-spin text-muted-foreground" />
          </div>
        ) : previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile preview"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <label
          htmlFor="image"
          className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer hover:bg-primaryHover transition-colors"
        >
          <Upload className="w-4 h-4 text-white " />
        </label>
        <input
          type="file"
          id="image"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
