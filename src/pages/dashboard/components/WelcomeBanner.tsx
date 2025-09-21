import { useAuthStore } from "@/hooks/useAuthStore";
import { formatDate } from "@/utilis/helperFunctions";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
export default function WelcomeBanner() {
  const { user } = useAuthStore();
  return (
    <div className="flex flex-row items-center font-sans justify-between">
      <div className="flex flex-col gap-2.5">
        <h1 className="text-2xl font-semibold">Welcome, {user?.name}!</h1>
        <p className="text-sm text-gray-500">
          {formatDate(true)}
        </p>
      </div>
      <div className="flex flex-row gap-2">
        <Button variant="outline" className="flex items-center gap-2">
          <Link to="/annotate" className="flex">
            Spectogram Viewer
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </Button>
        <Button variant="outline" className="flex items-center gap-2"> 
            Upload Data
            <ArrowUp className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
