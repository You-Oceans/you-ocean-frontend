import { useState, useEffect } from "react";
import { DateSelector } from "./DateSelector";
import {
  SpeciesData,
  SpeciesDetails as SpeciesDetailsType,
} from "../types/species";
import { transformDataToPoints } from "../utilis/transform-data";
import SpeciesDetails from "./SpeciesDetails";

export default function SpeciesVisualization() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SpeciesData[]>([]);
  const [details, setDetails] = useState<SpeciesDetailsType>({
    isOpen: false,
    data: null,
  });


  const formatDateForApi = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  useEffect(() => {
    if (date) {
      const formattedDate = formatDateForApi(date);
      setLoading(true);
      fetch(`http://localhost:3000/data/fetchData?Date=${formattedDate}`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setData(data.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setLoading(false);
        });
    }
  }, [date]);

  const handleSpeciesClick = (point: SpeciesData) => {
    setDetails({
      isOpen: true,
      data: { ...point, isLoading: true },
    });
    // Simulate loading delay
    setTimeout(() => {
      setDetails((prev) => ({
        ...prev,
        data: { ...point, isLoading: false },
      }));
    }, 1000);
  };

  const points = transformDataToPoints(data);

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          Species Visualization
        </h1>
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium text-gray-700">Select Date:</h2>
          <DateSelector date={date} onDateChange={setDate} />
        </div>
      </div>
      <div className="w-full max-w-3xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="relative w-full h-[500px] bg-gradient-to-br from-gray-900 to-blue-900 rounded-t-lg">
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

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-black/80 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-white" />
              <span className="text-white text-sm font-medium">Blue Whale</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-white text-sm font-medium">
                Humpback Whale
              </span>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
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
      </div>
      
    </div>
  );
}
