import { useEffect } from "react";
import { SpeciesData } from "../types/species";
import Shimmer from "./Shimmer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface SpeciesDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  data: SpeciesData | null;
}

export default function SpeciesDetails({
  isOpen,
  onClose,
  data,
}: SpeciesDetailsProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!data) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-[400px] bg-white/95 backdrop-blur-lg shadow-lg"
      >
        <div className="p-6 h-full overflow-auto">
          <SheetHeader>
            <SheetTitle className="text-3xl font-bold mb-4">
              {data.label} Details
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-8 my-8">
            {data.isLoading ? (
              <Shimmer />
            ) : (
              <div className="grid gap-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">
                    Date
                  </span>
                  <Badge variant="secondary">{data.date}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">
                    Time
                  </span>
                  <Badge variant="secondary">{`${data.hour}:${Math.floor(
                    data.second / 60
                  )
                    .toString()
                    .padStart(2, "0")}`}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">
                    Confidence
                  </span>
                  <Badge variant="outline" className="text-green-600">
                    {(data.confidence * 100).toFixed(2)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">
                    Duration
                  </span>
                  <Badge variant="secondary">{data.duration}ms</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">
                    Mean Frequency
                  </span>
                  <Badge variant="secondary">
                    {data.mean_frequency.toFixed(2)} Hz
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
