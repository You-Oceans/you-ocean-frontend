import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Play, ExternalLink } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";


interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: string;
  iconAlt: string;
  isFirstCard?: boolean;
}

function StatCard({ title, value, description, icon, iconAlt, isFirstCard = false }: StatCardProps) {
  return (
    <Card className={`border-gray-200 bg-gradient-to-br to-white ${
      isFirstCard ? 'from-blue-50 border-blue-200' : 'from-gray-50'
    }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-700">
          {title}
        </CardTitle>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isFirstCard ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          <img src={icon} alt={iconAlt} className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        <p className="text-xs text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
}

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

interface StatisticsDashboardProps {
  data: DetectionData[];
}

export default function StatisticsDashboard({
  data,
}: StatisticsDashboardProps) {
  // Enhanced safety checks
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
          <CardDescription>
            Please select a time period to view statistics.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  try {
    // Group data by species (label)
    const speciesGroups = data.reduce((acc, item) => {
      if (!item || !item.label) {
        console.warn("Invalid data item:", item);
        return acc;
      }
      if (!acc[item.label]) {
        acc[item.label] = [];
      }
      acc[item.label].push(item);
      return acc;
    }, {} as Record<string, DetectionData[]>);

  // Calculate statistics for each species
  const speciesStats = Object.entries(speciesGroups).map(([label, items]) => {
    const avgConfidence =
      items.reduce((sum, item) => sum + item.confidence, 0) / items.length;
    const avgDuration =
      items.reduce((sum, item) => sum + item.duration, 0) / items.length;
    const avgL50Power =
      items.reduce((sum, item) => sum + item.l50_power, 0) / items.length;
    const avgL75Power =
      items.reduce((sum, item) => sum + item.l75_power, 0) / items.length;
    const avgL90Power =
      items.reduce((sum, item) => sum + item.l90_power, 0) / items.length;
    const count = items.length;

    // Get distribution by hour
    const hourlyDistribution = Array(24).fill(0);
    items.forEach((item) => {
      hourlyDistribution[item.hour]++;
    });

    return {
      label,
      count,
      avgConfidence,
      avgDuration,
      avgL50Power,
      avgL75Power,
      avgL90Power,
      hourlyDistribution,
    };
  });

  // Format species labels for display
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

  // Get scientific name for species
  const getScientificName = (label: string) => {
    switch (label) {
      case "BLUE_A":
      case "BLUE_B":
        return "Balaenoptera musculus";
      case "HUMPBACK":
        return "Megaptera novaeangliae";
      case "SHIP":
        return "Anthropogenic sound";
      default:
        return "";
    }
  };

  // Get whale image for species
  const getSpeciesImage = (label: string) => {
    switch (label) {
      case "BLUE_A":
      case "BLUE_B":
      case "HUMPBACK":
        return "/bluewhale.svg";
      case "SHIP":
        return "/ship.svg"; // You might want to add a ship icon
      default:
        return "/bluewhale.svg";
    }
  };

  // Prepare data for charts
  const countData = speciesStats.map((stat) => ({
    name: formatSpeciesLabel(stat.label),
    count: stat.count,
  }));


  const powerData = speciesStats.map((stat) => ({
    name: formatSpeciesLabel(stat.label),
    l50: Number.parseFloat(stat.avgL50Power.toFixed(2)),
    l75: Number.parseFloat(stat.avgL75Power.toFixed(2)),
    l90: Number.parseFloat(stat.avgL90Power.toFixed(2)),
  }));

  // Get overall statistics
  const totalDetections = data.length;
  const dateRange = [...new Set(data.map((item) => item.date))].sort();
  const startDate = dateRange[0];
  const endDate = dateRange[dateRange.length - 1];
  const avgConfidenceOverall =
    data.reduce((sum, item) => sum + item.confidence, 0) / totalDetections;

  // Prepare hourly distribution data for all species combined
  const hourlyData = Array(24).fill(0);
  data.forEach((item) => {
    hourlyData[item.hour]++;
  });

  const hourlyChartData = hourlyData.map((count, hour) => ({
    hour: hour.toString(),
    count,
  }));

  // Helper function for date description
  const getDateDescription = () => {
    return startDate === endDate ? `From ${startDate}` : `From ${startDate} - ${endDate}`;
  };

  // Chart configurations
  const countChartConfig = {
    count: {
      label: "Detections",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const hourlyChartConfig = {
    count: {
      label: "Detections",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const powerChartConfig = {
    l50: {
      label: "L50 Power (dB)",
      color: "hsl(var(--chart-1))",
    },
    l75: {
      label: "L75 Power (dB)",
      color: "hsl(var(--chart-2))",
    },
    l90: {
      label: "L90 Power (dB)",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  // Create stats data array for cleaner rendering
  const statsData = [
    {
      title: "Total Detection",
      value: totalDetections,
      description: getDateDescription(),
      icon: "/sensors.svg",
      iconAlt: "Sensors",
      isFirstCard: true
    },
    {
      title: "Species Detected",
      value: speciesStats.length,
      description: getDateDescription(),
      icon: "/Whale.svg",
      iconAlt: "Whale"
    },
    {
      title: "Avg. Confidence",
      value: `${(avgConfidenceOverall * 100).toFixed(1)}%`,
      description: getDateDescription(),
      icon: "/avg_pace.svg",
      iconAlt: "Average Pace"
    },
    {
      title: "Peak Detection Hour",
      value: `${hourlyData.indexOf(Math.max(...hourlyData))}:00`,
      description: "Hour with most detections",
      icon: "/pace.svg",
      iconAlt: "Pace"
    }
  ];

  return (
    <div className="flex gap-10 flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat,) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            iconAlt={stat.iconAlt}
            isFirstCard={stat.isFirstCard}
          />
        ))}
      </div>

      <Tabs defaultValue="overview" className="p-6 gap-6 flex flex-col border rounded-md">
        <TabsList className="grid  grid-cols-4 h-10">
          <TabsTrigger  value="overview">
            Overview
          </TabsTrigger>
          <TabsTrigger  value="species">
            By Species
          </TabsTrigger>
          <TabsTrigger  value="hourly">
            Hourly Distribution
          </TabsTrigger>
          <TabsTrigger  value="power">
            Power Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-6">
          <Card >
            <CardHeader>
              <CardTitle>Detection Count by Species</CardTitle>
              <CardDescription>
                Number of detections for each species in the selected time
                period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={countChartConfig} className="h-80 w-full">
                <BarChart accessibilityLayer data={countData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.length > 8 ? value.slice(0, 8) + "..." : value}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar 
                    dataKey="count" 
                    fill="var(--color-count)" 
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="species" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speciesStats.map((stat) => (
              <Card key={stat.label} className="overflow-hidden border border-gray-200 bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {formatSpeciesLabel(stat.label)}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500 italic">
                        {getScientificName(stat.label)}
                      </CardDescription>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <img 
                          src={getSpeciesImage(stat.label)} 
                          alt={formatSpeciesLabel(stat.label)}
                          className=""
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Detections */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Detections</span>
                      <span className="font-semibold text-gray-900">{stat.count}</span>
                    </div>
                    
                    {/* Confidence */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Confidence</span>
                      <span className="font-semibold text-gray-900">
                        {(stat.avgConfidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    {/* Avg. Duration */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. Duration</span>
                      <span className="font-semibold text-gray-900">
                        {stat.avgDuration.toFixed(1)} s
                      </span>
                    </div>
                    
                    {/* Mean Frequency */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Mean Frequency</span>
                      <span className="font-semibold text-gray-900">
                        {data.find((d) => d.label === stat.label)?.mean_frequency?.toFixed(1) || 0} Hz
                      </span>
                    </div>
                    
                    {/* L50 Power */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">L50 Power</span>
                      <span className="font-semibold text-gray-900">
                        {stat.avgL50Power.toFixed(2)} dB
                      </span>
                    </div>
                    
                    {/* L75 Power */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">L75 Power</span>
                      <span className="font-semibold text-gray-900">
                        {stat.avgL75Power.toFixed(2)} dB
                      </span>
                    </div>
                    
                    {/* L90 Power */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">L90 Power</span>
                      <span className="font-semibold text-gray-900">
                        {stat.avgL90Power.toFixed(2)} dB
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100">
                    <button className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                      <Play className="w-4 h-4 text-gray-600" fill="currentColor" />
                    </button>
                    <button className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                      <ExternalLink className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="hourly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Detection Distribution</CardTitle>
              <CardDescription>
                Number of detections by hour of day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={hourlyChartConfig} className="h-80 w-full">
                <BarChart accessibilityLayer data={hourlyChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => `${value}:00`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    labelFormatter={(value) => `Hour ${value}:00`}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar 
                    dataKey="count" 
                    fill="var(--color-count)" 
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="power" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Power Analysis by Species</CardTitle>
              <CardDescription>
                Average power levels (L50, L75, L90) for each species
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={powerChartConfig} className="h-80 w-full">
                <BarChart accessibilityLayer data={powerData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.length > 8 ? value.slice(0, 8) + "..." : value}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar 
                    dataKey="l50" 
                    fill="var(--color-l50)" 
                    radius={4}
                  />
                  <Bar 
                    dataKey="l75" 
                    fill="var(--color-l75)" 
                    radius={4}
                  />
                  <Bar 
                    dataKey="l90" 
                    fill="var(--color-l90)" 
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
  } catch (error) {
    console.error("Error processing statistics data:", error);
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error Processing Data</CardTitle>
          <CardDescription>
            There was an error processing the statistics data. Please try again.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
}
