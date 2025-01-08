import { useState } from "react";
import { ArrowLeft, Mail, User2, Users, Pencil, Save } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { toast } from "sonner";
import { uploadImage } from "../utilis/imageUpload";

export default function ProfileEdit() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    name: user?.name || "",
    gender: user?.gender || "",
    purpose: user?.purpose || "",
    about: user?.about || "",
    profileImage: user?.profileImage || "",
  });
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await axios.put("http://localhost:3000/auth/user/update", formData);
      if (response.status === 200) {
        updateUser(response.data);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        console.error("Failed to update profile:", response.data.message);
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageUploading(true);
      const secureUrl = await uploadImage(file);
      if (secureUrl) {
        setFormData((prev) => ({ ...prev, profileImage: secureUrl }));
      }
      setImageUploading(false);
    }
  };
  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <Card className="max-w-xl mx-auto">
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-primary/10 to-primary/30 rounded-t-lg" />
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                <AvatarImage src={formData.profileImage} alt={formData.name} className="object-cover" />
                <AvatarFallback className="text-2xl bg-primary/20">
                  {getInitials(formData.name)}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full "
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {isEditing && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>

        <CardContent className="pt-20">
          <div className="text-center mb-8">
            {isEditing ? (
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="text-center text-xl font-bold mb-2"
              />
            ) : (
              <h1 className="text-2xl font-bold text-foreground mb-2">{formData.name}</h1>
            )}
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div className="grid gap-6 max-w-xl mx-auto">
            {/* Gender Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User2 className="w-4 h-4" />
                  <span>Gender</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              {isEditing ? (
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHERS">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-foreground pl-6">{formData.gender || "Not specified"}</p>
              )}
            </div>

            {/* Purpose Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Purpose</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              {isEditing ? (
                <Textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData((prev) => ({ ...prev, purpose: e.target.value }))}
                />
              ) : (
                <p className="text-foreground pl-6">{formData.purpose || "Not specified"}</p>
              )}

<div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User2 className="w-4 h-4" />
                  <span>About</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              {isEditing ? (
                <Textarea
                  value={formData.about}
                  onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                  className="min-h-[100px]"
                />
              ) : (
                <p className="text-foreground pl-6 whitespace-pre-wrap">
                  {formData.about || 'No description provided'}
                </p>
              )}
            </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between gap-4">
            <Button className="gap-2 w-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            {isEditing && (
              <Button className="gap-2 w-full" onClick={handleSave} disabled={loading || imageUploading}>
                {loading || imageUploading ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

