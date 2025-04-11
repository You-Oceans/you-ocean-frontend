"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";

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

interface AggregatedStatsProps {
  data: DetectionData[];
  startDate: string;
  endDate: string;
  selectedSpecies?: string[];
}

export default function AggregatedStats({
  data,
//   startDate,
//   endDate,
  selectedSpecies = [],
}: AggregatedStatsProps) {
  const [aggregationType, setAggregationType] = useState<"week" | "month">(
    "week"
  );
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);
  const [activeMetric, setActiveMetric] = useState<string>("count");

  // Process data to create weekly or monthly aggregations
  useEffect(() => {
    if (!data || data.length === 0) return;

    // Filter data by selected species if provided
    const filteredData =
      selectedSpecies.length > 0
        ? data.filter((item) => selectedSpecies.includes(item.label))
        : data;

    // Group data by week or month
    const groupedData: Record<string, Record<string, any>> = {};

    filteredData.forEach((item) => {
      const date = new Date(item.date);
      let groupKey: string;

      if (aggregationType === "week") {
        // Get week number and year
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear =
          (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNumber = Math.ceil(
          (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
        );
        groupKey = `Week ${weekNumber}, ${date.getFullYear()}`;
      } else {
        // Get month and year
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        groupKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      }

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {};
      }

      if (!groupedData[groupKey][item.label]) {
        groupedData[groupKey][item.label] = {
          count: 0,
          confidence: 0,
          duration: 0,
          l50_power: 0,
          l75_power: 0,
          l90_power: 0,
          totalItems: 0,
        };
      }

      groupedData[groupKey][item.label].count += 1;
      groupedData[groupKey][item.label].confidence += item.confidence;
      groupedData[groupKey][item.label].duration += item.duration;
      groupedData[groupKey][item.label].l50_power += item.l50_power;
      groupedData[groupKey][item.label].l75_power += item.l75_power;
      groupedData[groupKey][item.label].l90_power += item.l90_power;
      groupedData[groupKey][item.label].totalItems += 1;
    });

    // Calculate averages and format data for chart
    const formattedData = Object.entries(groupedData).map(
      ([period, speciesData]) => {
        const result: any = { period };

        Object.entries(speciesData).forEach(([species, metrics]) => {
          // Calculate averages
          result[`${species}_count`] = metrics.count;
          result[`${species}_confidence`] =
            metrics.confidence / metrics.totalItems;
          result[`${species}_duration`] = metrics.duration / metrics.totalItems;
          result[`${species}_l50_power`] =
            metrics.l50_power / metrics.totalItems;
          result[`${species}_l75_power`] =
            metrics.l75_power / metrics.totalItems;
          result[`${species}_l90_power`] =
            metrics.l90_power / metrics.totalItems;
        });

        return result;
      }
    );

    // Sort by period
    if (aggregationType === "week") {
      formattedData.sort((a, b) => {
        const weekA = Number.parseInt(a.period.split(" ")[1]);
        const weekB = Number.parseInt(b.period.split(" ")[1]);
        return weekA - weekB;
      });
    } else {
      const monthOrder = {
        January: 0,
        February: 1,
        March: 2,
        April: 3,
        May: 4,
        June: 5,
        July: 6,
        August: 7,
        September: 8,
        October: 9,
        November: 10,
        December: 11,
      };

      formattedData.sort((a, b) => {
        const monthA = a.period.split(" ")[0];
        const monthB = b.period.split(" ")[0];
        return monthOrder[monthA as keyof typeof monthOrder] - monthOrder[monthB as keyof typeof monthOrder];
      });
    }

    setAggregatedData(formattedData);
  }, [data, selectedSpecies, aggregationType]);

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
        return `${
          aggregationType === "week" ? "Weekly" : "Monthly"
        } Detection Count`;
      case "confidence":
        return `${
          aggregationType === "week" ? "Weekly" : "Monthly"
        } Average Confidence`;
      case "duration":
        return `${
          aggregationType === "week" ? "Weekly" : "Monthly"
        } Average Duration (seconds)`;
      case "l50_power":
        return `${
          aggregationType === "week" ? "Weekly" : "Monthly"
        } Average L50 Power (dB)`;
      case "l75_power":
        return `${
          aggregationType === "week" ? "Weekly" : "Monthly"
        } Average L75 Power (dB)`;
      case "l90_power":
        return `${
          aggregationType === "week" ? "Weekly" : "Monthly"
        } Average L90 Power (dB)`;
      default:
        return "Aggregated Data";
    }
  };

  const getMetricDescription = (metric: string) => {
    switch (metric) {
      case "count":
        return `Total number of detections per ${aggregationType} for each species`;
      case "confidence":
        return `Average confidence level per ${aggregationType} for each species`;
      case "duration":
        return `Average call duration in seconds per ${aggregationType} for each species`;
      case "l50_power":
        return `Average L50 power level in dB per ${aggregationType} for each species`;
      case "l75_power":
        return `Average L75 power level in dB per ${aggregationType} for each species`;
      case "l90_power":
        return `Average L90 power level in dB per ${aggregationType} for each species`;
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
          Please select a time period with data to view aggregated statistics.
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
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">
          {aggregationType === "week" ? "Weekly" : "Monthly"} Statistics{" "}
        </h3>
        <div className="flex space-x-2 py-6">
          <Button
            variant={aggregationType === "week" ? "default" : "outline"}
            onClick={() => setAggregationType("week")}
          >
            Weekly
          </Button>
          <Button
            variant={aggregationType === "month" ? "default" : "outline"}
            onClick={() => setAggregationType("month")}
          >
            Monthly
          </Button>
        </div>
      </div>

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
                  <BarChart data={aggregatedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
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
                    />
                    <Legend
                      formatter={(value) => {
                        const speciesCode = value;
                        return formatSpeciesLabel(speciesCode);
                      }}
                    />
                    {speciesToShow.map((species) => (
                      <Bar
                        key={species}
                        dataKey={`${species}_${metric}`}
                        name={species}
                        fill={getSpeciesColor(species)}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
