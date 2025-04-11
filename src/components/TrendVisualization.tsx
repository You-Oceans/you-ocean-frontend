"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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

interface TrendVisualizationProps {
  data: DetectionData[];
  startDate: string;
  endDate: string;
  selectedSpecies?: string[];
}

export default function TrendVisualization({
  data,
  //   startDate,
  //   endDate,
  selectedSpecies = [],
}: TrendVisualizationProps) {
  const [trendData, setTrendData] = useState<any[]>([]);
  const [activeMetric, setActiveMetric] = useState<string>("count");

  // Process data to create daily trends
  useEffect(() => {
    if (!data || data.length === 0) return;

    // Filter data by selected species if provided
    const filteredData =
      selectedSpecies.length > 0
        ? data.filter((item) => selectedSpecies.includes(item.label))
        : data;

    // Group data by date
    const groupedByDate = filteredData.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = {};
      }

      if (!acc[item.date][item.label]) {
        acc[item.date][item.label] = {
          count: 0,
          confidence: 0,
          duration: 0,
          l50_power: 0,
          l75_power: 0,
          l90_power: 0,
        };
      }

      acc[item.date][item.label].count += 1;
      acc[item.date][item.label].confidence += item.confidence;
      acc[item.date][item.label].duration += item.duration;
      acc[item.date][item.label].l50_power += item.l50_power;
      acc[item.date][item.label].l75_power += item.l75_power;
      acc[item.date][item.label].l90_power += item.l90_power;

      return acc;
    }, {} as Record<string, Record<string, any>>);

    // Calculate averages and format data for chart
    const formattedData = Object.entries(groupedByDate).map(
      ([date, speciesData]) => {
        const result: any = { date };

        Object.entries(speciesData).forEach(([species, metrics]) => {
          // Calculate averages
          result[`${species}_count`] = metrics.count;
          result[`${species}_confidence`] = metrics.confidence / metrics.count;
          result[`${species}_duration`] = metrics.duration / metrics.count;
          result[`${species}_l50_power`] = metrics.l50_power / metrics.count;
          result[`${species}_l75_power`] = metrics.l75_power / metrics.count;
          result[`${species}_l90_power`] = metrics.l90_power / metrics.count;
        });

        return result;
      }
    );

    // Sort by date
    formattedData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setTrendData(formattedData);
  }, [data, selectedSpecies]);

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

  // Generate a unique color for each species
  const getSpeciesColor = (species: string) => {
    const colors = [
      "#8884d8",
      "#82ca9d",
      "#ffc658",
      "#ff8042",
      "#0088FE",
      "#00C49F",
      "#FFBB28",
      "#FF8042",
      "#a4de6c",
      "#d0ed57",
      "#83a6ed",
      "#8dd1e1",
    ];

    // Use a hash function to consistently map species to colors
    const hash = species.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  const getMetricTitle = (metric: string) => {
    switch (metric) {
      case "count":
        return "Daily Detection Count";
      case "confidence":
        return "Average Confidence";
      case "duration":
        return "Average Duration (seconds)";
      case "l50_power":
        return "Average L50 Power (dB)";
      case "l75_power":
        return "Average L75 Power (dB)";
      case "l90_power":
        return "Average L90 Power (dB)";
      default:
        return "Trend Data";
    }
  };

  const getMetricDescription = (metric: string) => {
    switch (metric) {
      case "count":
        return "Number of detections per day for each species";
      case "confidence":
        return "Average confidence level per day for each species";
      case "duration":
        return "Average call duration in seconds per day for each species";
      case "l50_power":
        return "Average L50 power level in dB per day for each species";
      case "l75_power":
        return "Average L75 power level in dB per day for each species";
      case "l90_power":
        return "Average L90 power level in dB per day for each species";
      default:
        return "";
    }
  };

  const formatYAxisTick = (value: number) => {
    if (activeMetric === "confidence") {
      return `${(value * 100).toFixed(0)}%`;
    }
    return value.toFixed(activeMetric === "count" ? 0 : 1);
  };

  if (!data || data.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No data available</AlertTitle>
        <AlertDescription>
          Please select a time period with data to view trend analysis.
        </AlertDescription>
      </Alert>
    );
  }

  // Extract all unique species from filtered data
  const uniqueSpecies = Array.from(new Set(data.map((item) => item.label)));
  const speciesToShow =
    selectedSpecies.length > 0 ? selectedSpecies : uniqueSpecies;

  return (
    <div className="space-y-4">
      <Tabs
        defaultValue="count"
        onValueChange={setActiveMetric}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="count">Count</TabsTrigger>
          <TabsTrigger value="confidence">Confidence</TabsTrigger>
          {/* <TabsTrigger value="duration">Duration</TabsTrigger> */}
          <TabsTrigger value="l50_power">L50 Power</TabsTrigger>
          <TabsTrigger value="l75_power">L75 Power</TabsTrigger>
          <TabsTrigger value="l90_power">L90 Power</TabsTrigger>
        </TabsList>

        {[
          "count",
          "confidence",
          "duration",
          "l50_power",
          "l75_power",
          "l90_power",
        ].map((metric) => (
          <TabsContent key={metric} value={metric} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{getMetricTitle(metric)}</CardTitle>
                <CardDescription>
                  {getMetricDescription(metric)}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis tickFormatter={formatYAxisTick} />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        const speciesCode = name;
                        return [
                          metric === "confidence"
                            ? `${(value * 100).toFixed(1)}%`
                            : value.toFixed(metric === "count" ? 0 : 1),
                          formatSpeciesLabel(speciesCode),
                        ];
                      }}
                      labelFormatter={(label) => {
                        return new Date(label).toLocaleDateString();
                      }}
                    />
                    <Legend
                      formatter={(value) => {
                        const speciesCode = value;
                        return formatSpeciesLabel(speciesCode);
                      }}
                    />
                    {speciesToShow.map((species) => (
                      <Line
                        key={species}
                        type="monotone"
                        dataKey={`${species}_${metric}`}
                        name={species}
                        stroke={getSpeciesColor(species)}
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
