import { useState, useEffect } from "react";
import { DateSelector } from "./DateSelector";
import {
  SpeciesData,
  SpeciesDetails as SpeciesDetailsType,
} from "../types/species";
import { transformDataToPoints } from "../utilis/transform-data";
import SpeciesDetails from "./SpeciesDetails";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IoLocationOutline } from "react-icons/io5";
export default function SpeciesVisualization() {
  const [date, setDate] = useState<Date | undefined>(new Date(2024, 0, 1));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SpeciesData[]>([]);
  const [details, setDetails] = useState<SpeciesDetailsType>({
    isOpen: false,
    data: null,
  });
  const formatDateForApi = (date: Date) => {
    const minDate = new Date(2024, 0, 1);
    const maxDate = new Date(2024, 6, 31);
    if (date < minDate) return "2024-01-01";
    if (date > maxDate) return "2024-07-31";

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const apiUrl = import.meta.env.VITE_API_FETCHDATA_API;
  useEffect(() => {
    if (date) {
      const formattedDate = formatDateForApi(date);
      setLoading(true);
      fetch(`${apiUrl}/data/fetchData?Date=${formattedDate}`, {
        credentials: "include",
      })
        .then((response) => response.json())
        .then((result) => {
          console.log(result);

          if (
            result.success &&
            (result.data === "Acknowledged." ||
              !result.data ||
              result.data.length === 0)
          ) {
            setData([]);
          } else {
            setData(result.data);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setData([]);
          setLoading(false);
        });
    }
  }, [date]);

  const handleSpeciesClick = (point: SpeciesData) => {
    setDetails({
      isOpen: true,
      data: { ...point, isLoading: true },
    });

    setTimeout(() => {
      setDetails((prev) => ({
        ...prev,
        data: { ...point, isLoading: false },
      }));
    }, 1000);
  };

  const points = transformDataToPoints(data);

  return (
    <div className="container mx-auto lg:px-6 py-8">
      <Card className="w-full">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            Species Visualization
          </CardTitle>
          <div className="flex items-center space-x-2 lg:space-x-4">
            <h2 className="text-sm lg:text-lg font-medium text-gray-700">
              Select Date:
            </h2>
            <DateSelector
              date={date}
              onDateChange={(selectedDate) => {
                const minDate = new Date(2024, 0, 1);
                const maxDate = new Date(2024, 6, 31);

                if (
                  selectedDate &&
                  selectedDate >= minDate &&
                  selectedDate <= maxDate
                ) {
                  setDate(selectedDate);
                }
              }}
              minDate={new Date(2024, 0, 1)}
              maxDate={new Date(2024, 6, 31)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[600px] lg:h-[500px] bg-gradient-to-br from-gray-900 to-blue-900 rounded-lg">
            <svg viewBox="-200 -200 400 400" className="w-full h-full">
              {/* Clock circle */}
              <circle
                cx="0"
                cy="0"
                r="150"
                fill="none"
                stroke="rgb(245, 158, 11)"
                strokeWidth="2"
              />

              {/* Hour markers (showing only 12AM, 6AM, 12PM, 6PM) */}
              {[0, 6, 12, 18].map((hour) => {
                const angle = ((hour * 360) / 24 - 90) * (Math.PI / 180);
                const x1 = 140 * Math.cos(angle);
                const y1 = 140 * Math.sin(angle);
                const x2 = 150 * Math.cos(angle);
                const y2 = 150 * Math.sin(angle);
                return (
                  <line
                    key={hour}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="white"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Hour labels for 12AM, 6AM, 12PM, and 6PM */}
              {[0, 6, 12, 18].map((hour) => {
                const angle = ((hour * 360) / 24 - 90) * (Math.PI / 180);
                const x = 170 * Math.cos(angle);
                const y = 170 * Math.sin(angle);
                return (
                  <text
                    key={hour}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgb(59, 130, 246)"
                    fontSize="14"
                    className="font-medium"
                  >
                    {hour === 0
                      ? "12AM"
                      : hour === 12
                      ? "12PM"
                      : `${hour === 6 || hour === 18 ? hour : ""}${
                          hour < 12 ? "AM" : "PM"
                        }`}
                  </text>
                );
              })}

              {/* Species points */}
              {points.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r="8"
                  fill={point.color}
                  className="cursor-pointer hover:opacity-75 transition-opacity"
                  onClick={() => handleSpeciesClick(point)}
                >
                  <title>{point.label}</title>
                </circle>
              ))}
            </svg>

            <div className="absolute bottom-4 left-4 right-4 flex flex-col lg:flex-row justify-start lg:justify-between space-y-2 lg:space-y-0">
              <div className="bg-black/80 px-2 py-1 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#22C55E]" />
                  <span className="text-white text-sm font-medium">
                    Blue A Whale
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#FFFFFF]" />
                  <span className="text-white text-sm font-medium">
                    Blue B Whale
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#FF0000]" />
                  <span className="text-white text-sm font-medium">
                    Humpback Whale
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#0000FF]" />
                  <span className="text-white text-sm font-medium">Ship</span>
                </div>
              </div>
              <div className="bg-black/80 px-2 py-1 rounded-lg flex items-center gap-2">
                <IoLocationOutline className="h-6 w-6 text-red-500" />
                <span className="text-white text-sm font-medium">
                  Monterey Bay Aquarium Research Institute (Hydrophone Station)
                </span>
              </div>
            </div>
          </div>

          {loading && (
            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
            </div>
          )}

          <SpeciesDetails
            isOpen={details.isOpen}
            onClose={() => setDetails({ isOpen: false, data: null })}
            data={details.data}
          />
        </CardContent>
      </Card>
    </div>
  );
}
