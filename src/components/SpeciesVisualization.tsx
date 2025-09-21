import { useState, useEffect } from "react";
import { SpeciesData } from "../types/species";
import { transformDataToPoints } from "../utilis/transform-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RotateCcw, Calendar as CalendarIcon } from "lucide-react";
import { format, isBefore, isAfter } from "date-fns";
import { cn } from "@/lib/utils";
export default function SpeciesVisualization() {
  const [date, setDate] = useState<Date | undefined>(new Date(2024, 0, 1));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SpeciesData[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<SpeciesData | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const minDate = new Date(2024, 0, 1);
  const maxDate = new Date(2024, 6, 31);

  const formatDateForApi = (date: Date) => {
    if (date < minDate) return "2024-01-01";
    if (date > maxDate) return "2024-07-31";

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && !isBefore(selectedDate, minDate) && !isAfter(selectedDate, maxDate)) {
      setDate(selectedDate);
      setSelectedPoint(null); // Reset selection when date changes
      setIsDatePickerOpen(false);
    }
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
    setSelectedPoint(point);
  };

  const getSpeciesDisplayName = (label: string) => {
    switch (label) {
      case "BLUE_A":
        return "Blue A Whale";
      case "BLUE_B":
        return "Blue B Whale";
      case "HUMPBACK":
        return "Humpback Whale";
      case "SHIP":
        return "Ship";
      default:
        return label;
    }
  };

  const getSpeciesColor = (label: string) => {
    switch (label) {
      case "BLUE_A":
        return "#8B5CF6"; // Purple
      case "BLUE_B":
        return "#06B6D4"; // Cyan
      case "HUMPBACK":
        return "#84CC16"; // Lime green
      case "SHIP":
        return "#EF4444"; // Red
      default:
        return "#6B7280";
    }
  };

  const points = transformDataToPoints(data);

  return (
    <div className="p-6 rounded-md border space-y-8">
      {/* Header with Custom Date Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-base font-semibold">Species Visualization</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Select Date:</span>
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[280px] justify-between text-left font-normal bg-white hover:bg-gray-50 border-gray-200 transition-colors",
                  !date && "text-muted-foreground"
                )}
              >
                <div className="flex items-center">
                  <CalendarIcon className="mr-3 h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {date ? format(date, "EEEE, MMMM d, yyyy") : "Select a date"}
                  </span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 shadow-lg border-gray-200" align="start">
              <div className="p-4 border-b border-gray-100">
                <h4 className="font-medium text-sm text-gray-900">Select Date</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Choose a date for species visualization (Jan 1 - Jul 31, 2024)
                </p>
              </div>
              <div className="p-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={(date) => isBefore(date, minDate) || isAfter(date, maxDate)}
                  className="rounded-md"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Clock Visualization - 1/3 width */}
        <div className="col-span-1">
          <Card className="overflow-hidden h-full">
             <CardContent className="p-8">
               <div className="relative h-[400px] bg-white">
                 <svg viewBox="-180 -180 360 360" className="w-full h-full">
                   {/* Main clock circle */}
                   <circle
                     cx="0"
                     cy="0"
                     r="150"
                     fill="none"
                     stroke="#E5E7EB"
                     strokeWidth="2"
                   />

                   {/* Hour tick marks - small dashes */}
                   {Array.from({ length: 12 }, (_, i) => {
                     const angle = ((i * 360) / 12 - 90) * (Math.PI / 180);
                     const x1 = 140 * Math.cos(angle);
                     const y1 = 140 * Math.sin(angle);
                     const x2 = 150 * Math.cos(angle);
                     const y2 = 150 * Math.sin(angle);
                     
                     return (
                       <line
                         key={i}
                         x1={x1}
                         y1={y1}
                         x2={x2}
                         y2={y2}
                         stroke="#9CA3AF"
                         strokeWidth="2"
                       />
                     );
                   })}

                   {/* Hour labels - only 12AM, 6AM, 12PM, 6PM */}
                   {[
                     { hour: 0, label: "12AM", pos: { x: 0, y: -170 } },
                     { hour: 6, label: "6AM", pos: { x: 170, y: 0 } },
                     { hour: 12, label: "12PM", pos: { x: 0, y: 170 } },
                     { hour: 18, label: "6PM", pos: { x: -170, y: 0 } }
                   ].map(({ hour, label, pos }) => (
                     <text
                       key={hour}
                       x={pos.x}
                       y={pos.y}
                       textAnchor="middle"
                       dominantBaseline="middle"
                       fill="#6B7280"
                       fontSize="14"
                       className="font-medium"
                     >
                       {label}
                     </text>
                   ))}

                   {/* Species points */}
                   {points.map((point, i) => (
                     <g key={i}>
                       <circle
                         cx={point.x}
                         cy={point.y}
                         r={selectedPoint === point ? "10" : "6"}
                         fill={point.color}
                         stroke={selectedPoint === point ? "#000000" : "transparent"}
                         strokeWidth="2"
                         className="cursor-pointer transition-all duration-200"
                         style={{
                           transformOrigin: `${point.x}px ${point.y}px`,
                         }}
                         onClick={() => handleSpeciesClick(point)}
                         onMouseEnter={(e) => {
                          //@ts-expect-error
                           e.target.style.transform = 'scale(1.3)';
                           //@ts-expect-error
                           e.target.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))';
                         }}
                         onMouseLeave={(e) => {
                          //@ts-expect-error
                           e.target.style.transform = 'scale(1)';
                           //@ts-expect-error
                           e.target.style.filter = 'none';
                         }}
                       />
                       {selectedPoint === point && (
                         <circle
                           cx={point.x}
                           cy={point.y}
                           r="14"
                           fill="none"
                           stroke={point.color}
                           strokeWidth="1"
                           opacity="0.4"
                           className="animate-pulse"
                         />
                       )}
                     </g>
                   ))}
                 </svg>

                 {loading && (
                   <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                     <div className="flex items-center gap-3">
                       <RotateCcw className="w-5 h-5 text-gray-600 animate-spin" />
                       <span className="text-gray-600 font-medium">Loading species data...</span>
                     </div>
                   </div>
                 )}
               </div>
               
             </CardContent>
           </Card>
         </div>

        {/* Species Details Panel - 2/3 width */}
        <div className="col-span-1 lg:col-span-2">
          <Card className="h-fit">
            <CardContent className="p-6">
              {selectedPoint ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Species Details</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedPoint(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getSpeciesColor(selectedPoint.label) }}
                    />
                    <h4 className="text-lg font-medium text-gray-800">
                      {getSpeciesDisplayName(selectedPoint.label)}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-sm text-gray-500">Time</span>
                      <p className="font-medium">
                        {String(selectedPoint.hour).padStart(2, '0')}:{String(Math.floor(selectedPoint.second / 60)).padStart(2, '0')}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-sm text-gray-500">Confidence</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {(selectedPoint.confidence * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm text-gray-500">Duration</span>
                      <p className="font-medium">{selectedPoint.duration.toFixed(1)}s</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm text-gray-500">Frequency</span>
                      <p className="font-medium">{selectedPoint.mean_frequency?.toFixed(1) || 'N/A'} Hz</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm text-gray-500">L50 Power</span>
                      <p className="font-medium">{selectedPoint.l50_power?.toFixed(2) || 'N/A'} dB</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm text-gray-500">L75 Power</span>
                      <p className="font-medium">{selectedPoint.l75_power?.toFixed(2) || 'N/A'} dB</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="space-y-2">
                      <span className="text-sm text-gray-500">Detection ID</span>
                      <p className="text-xs font-mono bg-gray-50 p-2 rounded">
                        {selectedPoint.id || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                    <RotateCcw className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      Select a point on the clock to explore species activity
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      Click on a detection dot to view species details
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
