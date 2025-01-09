"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { SpeciesData } from "../types/species";
import Shimmer from "./Shimmer";

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
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!data) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        ref={panelRef}
        className={`fixed top-0 bottom-0 right-0 w-96 bg-white/80 backdrop-blur-sm shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 h-full overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{data.label} Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {data.isLoading ? (
                <Shimmer />
              ) : (
                <>
                  <div className="text-sm font-medium text-gray-500">Date</div>
                  <div>{data.date}</div>
                  <div className="text-sm font-medium text-gray-500">Time</div>
                  <div>{`${data.hour}:${Math.floor(data.second / 60)
                    .toString()
                    .padStart(2, "0")}`}</div>
                  <div className="text-sm font-medium text-gray-500">
                    Confidence
                  </div>
                  <div>{(data.confidence * 100).toFixed(2)}%</div>
                  <div className="text-sm font-medium text-gray-500">
                    Duration
                  </div>
                  <div>{data.duration}ms</div>
                  <div className="text-sm font-medium text-gray-500">
                    Mean Frequency
                  </div>
                  <div>{data.mean_frequency.toFixed(2)} Hz</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
