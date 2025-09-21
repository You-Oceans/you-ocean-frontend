import { useParams } from "react-router-dom";
import { ChevronLeft, BellRing, Bookmark, MapPin, Clock, Activity, Users, BarChart3, TrendingUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SpeciesSelector } from "@/components/SpeciesSelector";
import TrendVisualization from "@/components/TrendVisualization";
import AggregatedStats from "@/components/AggregateStats";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
// Types for API data
interface DetectionData {
  id: number;
  date: string;
  hour: number;
  second: number;
  label: string;
  confidence: number;
  duration: number;
  mean_frequency: number;
  l50_power: number;
  l75_power: number;
  l90_power: number;
}

// Mock data - will be replaced with API calls
const mockStationData = {
  id: "station-001",
  name: "Hydrophone Station",
  status: "Active",
  type: "Permanent Hydrophone",
  location: "California Current, Northeast Pacific",
  coordinates: "36.785° N, 122.147° W",
  operator: "MBARI",
  image: "/mbariLogo.svg",
  stats: {
    topSpecies: "Blue Whale (162 calls)",
    totalCalls: "382 calls",
    noiseLevel: "Avg 79 dB",
    lastUpdated: "2 hours ago"
  },
  detectionStats: {
    totalDetection: 16616,
    speciesDetected: 2,
    avgConfidence: "94.0%",
    peakDetectionHour: "17:00"
  },
  chartData: {
    species: [
      { name: "Humpback Whale", count: 1826, color: "#a855f7" },
      { name: "Blue Whale", count: 1200, color: "#84bcfc" },
      { name: "Fin Whale", count: 800, color: "#8d95e8" },
      { name: "Gray Whale", count: 600, color: "#8de89e" },
      { name: "Sperm Whale", count: 400, color: "#e8b08d" }
    ]
  }
};

export default function StationDetails() {
  const { stationId } = useParams();
  const navigate = useNavigate();
  
  // State for API data
  const [data, setData] = useState<DetectionData[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMonth, setSelectedMonth] = useState({ month: 7, year: 2024 });
  const [timeframe, setTimeframe] = useState<"week" | "month" | "custom">("month");
  const [allSpecies, setAllSpecies] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [customRange, setCustomRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "2024-01-01",
    endDate: "2024-07-31",
  });
  const [loading, setLoading] = useState(false);

  // TODO: Use stationId for station-specific API calls
  console.log('Station ID:', stationId);

  // Initialize data on component mount
  useEffect(() => {
    fetchData("month", undefined, selectedMonth);
  }, []);

  // Extract unique species from data
  useEffect(() => {
    if (data && data.length > 0) {
      const species = Array.from(new Set(data.map((item) => item.label)));
      setAllSpecies(species);

      // Set all species as selected by default
      if (selectedSpecies.length === 0) {
        setSelectedSpecies([...species]);
      }
    }
  }, [data]);

  const fetchData = async (
    timeframe: "week" | "month" | "custom",
    selectedDate?: Date,
    selectedMonth?: { month: number; year: number },
    customDates?: { startDate: string; endDate: string }
  ) => {
    setLoading(true);
    setTimeframe(timeframe);
    let apiUrl = import.meta.env.VITE_API_FETCHDATA_API;

    if (!apiUrl) {
      console.error("API URL is not defined in .env file");
      setLoading(false);
      return;
    }

    if (timeframe === "week") {
      if (!selectedDate) {
        const defaultDate = new Date(2024, 6, 1);
        setSelectedDate(defaultDate);
        setLoading(false);
        return fetchData("week", defaultDate);
      }
      const weekNumber = getISOWeek(selectedDate);
      const year = selectedDate.getFullYear();
      apiUrl = `${apiUrl}/data/fetchDataByWeek?weekNumber=${weekNumber}&year=${year}`;
    } else if (timeframe === "month" && selectedMonth) {
      const { month, year } = selectedMonth;
      apiUrl = `${apiUrl}/data/fetchDataByMonth?month=${month}&year=${year}`;
    } else if (timeframe === "custom" && customDates) {
      const { startDate, endDate } = customDates;
      apiUrl = `${apiUrl}/data/fetchByCustomRange?startDate=${startDate}&endDate=${endDate}`;
    }

    try {
      const response = await fetch(apiUrl);
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getISOWeek = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };

  const handleSpeciesChange = (species: string[]) => {
    setSelectedSpecies(species);
  };

  // Helper function to format species labels
  const formatSpeciesLabel = (label: string) => {
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

  // Process data for charts
  const processChartData = () => {
    if (!data || data.length === 0) return { countData: [], hourlyData: [], powerData: [] };

    // Group data by species
    const speciesGroups = data.reduce((acc, item) => {
      if (!acc[item.label]) {
        acc[item.label] = [];
      }
      acc[item.label].push(item);
      return acc;
    }, {} as Record<string, DetectionData[]>);

    // Calculate statistics for each species
    const speciesStats = Object.entries(speciesGroups).map(([label, items]) => {
      const avgConfidence = items.reduce((sum: number, item: DetectionData) => sum + (item.confidence || 0), 0) / items.length;
      const avgDuration = items.reduce((sum: number, item: DetectionData) => sum + (item.duration || 0), 0) / items.length;
      const avgL50Power = items.reduce((sum: number, item: DetectionData) => sum + (item.l50_power || 0), 0) / items.length;
      const avgL75Power = items.reduce((sum: number, item: DetectionData) => sum + (item.l75_power || 0), 0) / items.length;
      const avgL90Power = items.reduce((sum: number, item: DetectionData) => sum + (item.l90_power || 0), 0) / items.length;
      const count = items.length;

      return {
        label,
        count,
        avgConfidence,
        avgDuration,
        avgL50Power,
        avgL75Power,
        avgL90Power,
      };
    });

    // Prepare data for different chart types
    const countData = speciesStats.map((stat) => ({
      name: formatSpeciesLabel(stat.label),
      count: stat.count,
      value: stat.count,
    }));

    const powerData = speciesStats.map((stat) => ({
      name: formatSpeciesLabel(stat.label),
      l50: Number.parseFloat(stat.avgL50Power.toFixed(2)),
      l75: Number.parseFloat(stat.avgL75Power.toFixed(2)),
      l90: Number.parseFloat(stat.avgL90Power.toFixed(2)),
    }));

    // Prepare hourly distribution data
    const hourlyData = Array(24).fill(0);
    data.forEach((item) => {
      if (item.hour !== undefined) {
        hourlyData[item.hour]++;
      }
    });

    const hourlyChartData = hourlyData.map((count, hour) => ({
      hour: hour.toString(),
      count,
      time: `${hour}:00`,
    }));

    return { countData, hourlyData: hourlyChartData, powerData };
  };

  const { countData, hourlyData, powerData } = processChartData();

  // Chart colors
  const COLORS = ["#a855f7", "#84bcfc", "#8d95e8", "#8de89e", "#e8b08d"];
  const chartConfig = {
    count: {
      label: "Detections",
    },
    l50: {
      label: "L50 Power (dB)",
    },
    l75: {
      label: "L75 Power (dB)",
    },
    l90: {
      label: "L90 Power (dB)",
    },
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Main Content */}
      <div className="px-[130px] py-10">
        {/* Back Button */}
        <div onClick={() => navigate(-1)} className="flex cursor-pointer items-center gap-2.5 mb-10">
          <ChevronLeft className="w-3 h-3 text-[#5e6166]" />
          <span className="text-[#5e6166] text-[16px] font-medium">Back</span>
        </div>

        {/* Station Info Section */}
        <div className="flex gap-6 mb-10">
          {/* Left Panel - Station Details */}
          <div className="flex-1 bg-white border border-[#ebeef5] rounded-tl-lg rounded-bl-lg p-6">
            <div className="flex flex-col gap-7">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4">
                  {/* Station Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-[46px] h-[46px] bg-[#02014f] rounded-full flex items-center justify-center">
                        <img 
                          src={mockStationData.image} 
                          alt="Station" 
                          className="w-[46px] h-[46px] rounded-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <h1 className="text-[18px] font-semibold text-[#0e131a]">
                          {mockStationData.name}
                        </h1>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[14px] text-[#5e6166]">Status:</span>
                          <span className="text-[14px] text-[#248600]">{mockStationData.status}</span>
                          <div className="w-px h-4 bg-[#d2d5da]"></div>
                          <span className="text-[14px] text-[#131a24]">{mockStationData.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="h-9 px-3 text-[14px] font-medium">
                        <BellRing className="w-4 h-4 mr-1.5" />
                        Set Alert
                      </Button>
                      <Button className="h-9 px-4 bg-[#0e131a] text-white text-[14px] font-medium">
                        <Bookmark className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[14px] font-medium text-[#0e131a]">Location</span>
                    <span className="text-[14px] text-[#131a24]">{mockStationData.location}</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="flex gap-[46px]">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[14px] font-medium text-[#0e131a]">Top species</span>
                    <span className="text-[14px] text-[#131a24]">{mockStationData.stats.topSpecies}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[14px] font-medium text-[#0e131a]">Total calls (last 7d)</span>
                    <span className="text-[14px] text-[#131a24]">{mockStationData.stats.totalCalls}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[14px] font-medium text-[#0e131a]">Noise level</span>
                    <span className="text-[14px] text-[#131a24]">{mockStationData.stats.noiseLevel}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[14px] font-medium text-[#0e131a]">Last Updated</span>
                    <span className="text-[14px] text-[#131a24]">{mockStationData.stats.lastUpdated}</span>
                  </div>
                </div>
              </div>

              {/* Time Range Buttons */}
              <div className="flex items-center gap-1.5">
                <Button 
                  onClick={() => {
                    if (!selectedDate) {
                      const defaultDate = new Date(2024, 6, 1);
                      setSelectedDate(defaultDate);
                      fetchData("week", defaultDate);
                    } else {
                      fetchData("week", selectedDate);
                    }
                  }}
                  className={`h-10 px-4 rounded-[67.5px] text-[14px] font-medium ${
                    timeframe === "week" 
                      ? "bg-[#0078e8] text-white" 
                      : "bg-white border border-[#dde1eb] text-[#2b2c36]"
                  }`}
                  disabled={loading}
                >
                  Weekly Stats
                </Button>
                <Button 
                  onClick={() => {
                    setSelectedMonth({ month: 7, year: 2024 });
                    fetchData("month", undefined, selectedMonth);
                  }}
                  className={`h-10 px-4 rounded-[67.5px] text-[14px] font-medium ${
                    timeframe === "month" 
                      ? "bg-[#0078e8] text-white" 
                      : "bg-white border border-[#dde1eb] text-[#2b2c36]"
                  }`}
                  disabled={loading}
                >
                  Monthly Stats
                </Button>
                <Button 
                  onClick={() => {
                    setTimeframe("custom");
                    setCustomRange({ startDate: "2024-01-01", endDate: "2024-07-31" });
                    fetchData("custom", undefined, undefined, customRange);
                  }}
                  className={`h-10 px-4 rounded-[67.5px] text-[14px] font-medium ${
                    timeframe === "custom" 
                      ? "bg-[#0078e8] text-white" 
                      : "bg-white border border-[#dde1eb] text-[#2b2c36]"
                  }`}
                  disabled={loading}
                >
                  Custom range
                  <ChevronDown className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel - Map */}
          <div className="flex-1 bg-white border border-[#ebeef5] rounded-tr-lg rounded-br-lg relative overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <div className="w-[38px] h-[38px] bg-[#131a24] rounded-full flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {/* Map Info Overlay */}
            <div className="absolute bottom-2 left-2 bg-white p-4 rounded-lg shadow-sm w-[386px]">
              <div className="flex items-center gap-[46px]">
                <div className="flex items-center gap-5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4 text-[#5e6166]" />
                      <span className="text-[14px] text-[#5e6166]">Operator</span>
                    </div>
                    <span className="text-[14px] text-[#131a24]">{mockStationData.operator}</span>
                  </div>
                  <div className="w-px h-4 bg-[#d2d5da]"></div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#5e6166]" />
                      <span className="text-[14px] text-[#5e6166]">Coordinates</span>
                    </div>
                    <span className="text-[14px] text-[#131a24]">{mockStationData.coordinates}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-2 mb-10">
          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-6">
                  <span className="text-[14px] text-[#131a24]">Total Detection</span>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[24px] font-semibold text-[#131a24]">
                      {mockStationData.detectionStats.totalDetection.toLocaleString()}
                    </span>
                    <span className="text-[12px] font-medium text-[#5e6166]">
                      From Jan 1, 2024 - July 7, 2024
                    </span>
                  </div>
                </div>
                <Activity className="w-5 h-5 text-[#131a24]" />
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-6">
                  <span className="text-[14px] text-[#131a24]">Species Detected</span>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[24px] font-semibold text-[#131a24]">
                      {mockStationData.detectionStats.speciesDetected}
                      </span>
                    <span className="text-[12px] font-medium text-[#5e6166]">
                      From Jan 1, 2024 - July 7, 2024
                          </span>
                  </div>
                </div>
                <Users className="w-4 h-4 text-[#131a24]" />
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-6">
                  <span className="text-[14px] text-[#131a24]">Avg. Confidence</span>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[24px] font-semibold text-[#131a24]">
                      {mockStationData.detectionStats.avgConfidence}
                        </span>
                    <span className="text-[12px] font-medium text-[#5e6166]">
                      From Jan 1, 2024 - July 7, 2024
                        </span>
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-[#131a24]" />
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-6">
                  <span className="text-[14px] text-[#131a24]">Peak Detection Hour</span>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[24px] font-semibold text-[#131a24]">
                      {mockStationData.detectionStats.peakDetectionHour}
                        </span>
                    <span className="text-[12px] font-medium text-[#5e6166]">
                      Hour with most detections
                    </span>
                  </div>
                </div>
                <Clock className="w-4 h-4 text-[#131a24]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <Card className="p-6 mb-10">
          <CardContent className="p-0">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-[#f4f5f7] p-1">
                <TabsTrigger value="overview" className="bg-white text-[#2b2c36] text-[14px] font-medium">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="species" className="text-[#2b2c36] text-[14px] font-medium">
                  By Species
                </TabsTrigger>
                <TabsTrigger value="hourly" className="text-[#2b2c36] text-[14px] font-medium">
                  Hourly Distribution
                </TabsTrigger>
                <TabsTrigger value="power" className="text-[#2b2c36] text-[14px] font-medium">
                  Power Analysis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <div className="bg-white border border-[#ebeef5] rounded-lg p-6">
                  <div className="flex flex-col gap-4 mb-6">
                    <h3 className="text-[16px] font-medium text-[#131a24]">Detection Count by Species</h3>
                    <p className="text-[14px] text-[#5e6166]">
                      Number of detections for each species in the selected time period
                    </p>
                  </div>
                  
                  {/* Bar Chart */}
                  <div className="h-[401px]">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-gray-500">Loading chart data...</div>
                      </div>
                    ) : countData && countData.length > 0 ? (
                      <ChartContainer config={chartConfig} className="h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={countData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#d2d5da" />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 12, fill: '#6d7280' }}
                              axisLine={{ stroke: '#d2d5da' }}
                            />
                            <YAxis 
                              tick={{ fontSize: 12, fill: '#6d7280' }}
                              axisLine={{ stroke: '#d2d5da' }}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar 
                              dataKey="count" 
                              fill="#84bcfc"
                              radius={[4, 4, 0, 0]}
                              name="Detections"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="species" className="mt-6">
                <div className="bg-white border border-[#ebeef5] rounded-lg p-6">
                  <div className="flex flex-col gap-4 mb-6">
                    <h3 className="text-[16px] font-medium text-[#131a24]">Species Analysis</h3>
                    <p className="text-[14px] text-[#5e6166]">
                      Detailed breakdown of species detection patterns
                    </p>
                  </div>
                  
                  {allSpecies.length > 0 && (
                    <div className="mb-6">
                      <SpeciesSelector
                        species={allSpecies}
                        selectedSpecies={selectedSpecies}
                        onSpeciesChange={handleSpeciesChange}
                      />
                    </div>
                  )}

                  <div className="h-[401px]">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-gray-500">Loading species data...</div>
                      </div>
                    ) : countData && countData.length > 0 ? (
                      <ChartContainer config={chartConfig} className="h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={countData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="count"
                            >
                              {countData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No species data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="hourly" className="mt-6">
                <div className="bg-white border border-[#ebeef5] rounded-lg p-6">
                  <div className="flex flex-col gap-4 mb-6">
                    <h3 className="text-[16px] font-medium text-[#131a24]">Hourly Distribution</h3>
                    <p className="text-[14px] text-[#5e6166]">
                      Detection patterns throughout the day
                    </p>
                  </div>
                  
                  <div className="h-[401px]">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-gray-500">Loading hourly data...</div>
                      </div>
                    ) : hourlyData && hourlyData.length > 0 ? (
                      <ChartContainer config={chartConfig} className="h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={hourlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#d2d5da" />
                            <XAxis 
                              dataKey="time" 
                              tick={{ fontSize: 12, fill: '#6d7280' }}
                              axisLine={{ stroke: '#d2d5da' }}
                            />
                            <YAxis 
                              tick={{ fontSize: 12, fill: '#6d7280' }}
                              axisLine={{ stroke: '#d2d5da' }}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line 
                              type="monotone" 
                              dataKey="count" 
                              stroke="#84bcfc" 
                              strokeWidth={2}
                              dot={{ fill: '#84bcfc', strokeWidth: 2, r: 4 }}
                              name="Detections"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No hourly data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="power" className="mt-6">
                <div className="bg-white border border-[#ebeef5] rounded-lg p-6">
                  <div className="flex flex-col gap-4 mb-6">
                    <h3 className="text-[16px] font-medium text-[#131a24]">Power Analysis</h3>
                    <p className="text-[14px] text-[#5e6166]">
                      Acoustic power levels and frequency analysis
                    </p>
                  </div>
                  
                  <div className="h-[401px]">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-gray-500">Loading power analysis data...</div>
                      </div>
                    ) : powerData && powerData.length > 0 ? (
                      <ChartContainer config={chartConfig} className="h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={powerData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#d2d5da" />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 12, fill: '#6d7280' }}
                              axisLine={{ stroke: '#d2d5da' }}
                            />
                            <YAxis 
                              tick={{ fontSize: 12, fill: '#6d7280' }}
                              axisLine={{ stroke: '#d2d5da' }}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="l50" fill="#a855f7" name="L50 Power (dB)" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="l75" fill="#84bcfc" name="L75 Power (dB)" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="l90" fill="#8d95e8" name="L90 Power (dB)" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No power analysis data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Trend Analysis for Custom Date Range */}
        {timeframe === "custom" && data && data.length > 0 && (
          <Card className="p-6 mb-10">
            <CardContent className="p-0">
              <div className="mb-6">
                <h3 className="text-[16px] font-medium text-[#0e131a] mb-4">Trend Analysis</h3>
                <p className="text-[14px] text-[#5e6166]">
                  Visualize trends for your selected date range from{" "}
                  {customRange.startDate} to {customRange.endDate}
                </p>
              </div>

              {allSpecies.length > 0 && (
                <div className="mb-6">
                  <SpeciesSelector
                    species={allSpecies}
                    selectedSpecies={selectedSpecies}
                    onSpeciesChange={handleSpeciesChange}
                  />
                </div>
              )}

              <TrendVisualization
                data={data}
                startDate={customRange.startDate}
                endDate={customRange.endDate}
                selectedSpecies={selectedSpecies}
              />
              <AggregatedStats
                data={data}
                startDate={customRange.startDate}
                endDate={customRange.endDate}
                selectedSpecies={selectedSpecies}
              />
            </CardContent>
          </Card>
        )}

        {/* Species Visualization */}
        <Card className="p-6">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[16px] font-medium text-[#0e131a]">Species Visualization</h3>
              <Button variant="outline" className="h-10 px-4 rounded-[67.5px] text-[14px] font-medium">
                Custom range
                <ChevronDown className="w-5 h-5 ml-1" />
              </Button>
            </div>
            
            <div className="flex gap-6">
              {/* Clock Chart Placeholder */}
              <div className="w-[374px] h-[470px] bg-[#f7f9fc] rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Species activity clock chart</p>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-[52px] h-[52px] bg-[#edf6ff] rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-center">
                  <h4 className="text-[14px] font-medium text-[#0e131a] mb-2">
                    Select a point on the clock to explore species activity
                  </h4>
                  <p className="text-[14px] text-[#5e6166] w-[322px]">
                    Click on a detection dot to view species details
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
