import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Activity, BarChart3, Clock, Gauge } from "lucide-react";

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

  // Prepare data for charts
  const countData = speciesStats.map((stat) => ({
    name: formatSpeciesLabel(stat.label),
    count: stat.count,
  }));

  //   const confidenceData = speciesStats.map((stat) => ({
  //     name: formatSpeciesLabel(stat.label),
  //     confidence: Number.parseFloat(stat.avgConfidence.toFixed(2)),
  //   }));

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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Detections
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDetections}</div>
            <p className="text-xs text-muted-foreground">
              {startDate === endDate
                ? `On ${startDate}`
                : `From ${startDate} to ${endDate}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Species Detected
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{speciesStats.length}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {speciesStats.map((stat) => (
                <Badge key={stat.label} variant="outline">
                  {formatSpeciesLabel(stat.label)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Confidence
            </CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(avgConfidenceOverall * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall confidence across all detections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Peak Detection Hour
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hourlyData.indexOf(Math.max(...hourlyData))}:00
            </div>
            <p className="text-xs text-muted-foreground">
              Hour with most detections
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 ">
          <TabsTrigger className="text-xs lg:text-lg" value="overview">
            Overview
          </TabsTrigger>
          <TabsTrigger className="text-xs lg:text-lg" value="species">
            By Species
          </TabsTrigger>
          <TabsTrigger className="text-xs lg:text-lg" value="hourly">
            Hourly Distribution
          </TabsTrigger>
          <TabsTrigger className="text-xs lg:text-lg" value="power">
            Power Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detection Count by Species</CardTitle>
              <CardDescription>
                Number of detections for each species in the selected time
                period
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="species" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {speciesStats.map((stat) => (
              <Card key={stat.label}>
                <CardHeader>
                  <CardTitle>{formatSpeciesLabel(stat.label)}</CardTitle>
                  <CardDescription>{stat.count} detections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Confidence:</span>
                      <span className="font-medium">
                        {(stat.avgConfidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg. Duration:</span>
                      <span className="font-medium">
                        {stat.avgDuration.toFixed(1)} seconds
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Mean Frequency:</span>
                      <span className="font-medium">
                        {data.find((d) => d.label === stat.label)
                          ?.mean_frequency || 0}{" "}
                        Hz
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">L50 Power:</span>
                      <span className="font-medium">
                        {stat.avgL50Power.toFixed(2)} dB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">L75 Power:</span>
                      <span className="font-medium">
                        {stat.avgL75Power.toFixed(2)} dB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">L90 Power:</span>
                      <span className="font-medium">
                        {stat.avgL90Power.toFixed(2)} dB
                      </span>
                    </div>
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
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="Detections" />
                </BarChart>
              </ResponsiveContainer>
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
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={powerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="l50" fill="#8884d8" name="L50 Power (dB)" />
                  <Bar dataKey="l75" fill="#82ca9d" name="L75 Power (dB)" />
                  <Bar dataKey="l90" fill="#ffc658" name="L90 Power (dB)" />
                </BarChart>
              </ResponsiveContainer>
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
