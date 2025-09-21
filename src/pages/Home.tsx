"use client";

import { useEffect, useState } from "react";

// Components
import StatisticsDashboard from "@/components/StaticsDashBoard";
import SpeciesVisualization from "@/components/SpeciesVisualization";
// import TrendVisualization from "@/components/TrendVisualization";
// import { SpeciesSelector } from "@/components/SpeciesSelector";
// import AggregatedStats from "@/components/AggregateStats";
import { HydrophoneStation } from "@/components/HydrophoneStation";

// Utilities
import { fetchData, type FetchDataParams } from "@/utilis/dataService";
import { getDefaultWeekDate } from "@/utilis/dateUtils";
import {
  extractUniqueSpecies,
  initializeSelectedSpecies,
} from "@/utilis/dataProcessing";

export default function App() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  // const [timeframe, setTimeframe] = useState<"week" | "month" | "custom">(
  //   "month"
  // );
  // const [allSpecies, setAllSpecies] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  // const [currentCustomRange, setCurrentCustomRange] = useState<{
  //   startDate: string;
  //   endDate: string;
  // }>({
  //   startDate: "2024-01-01",
  //   endDate: "2026-07-31",
  // });

  // Initialize with default month data
  useEffect(() => {
    handleFetchData("month", undefined, { month: 7, year: 2024 });
  }, []);

  // Extract unique species from data and initialize selection
  useEffect(() => {
    if (data && data.length > 0) {
      const species = extractUniqueSpecies(data);
      // setAllSpecies(species);
      setSelectedSpecies(initializeSelectedSpecies(species, selectedSpecies));
    }
  }, [data]);

  // Wrapper function to handle data fetching with state updates
  const handleFetchData = async (
    timeframe: "week" | "month" | "custom",
    selectedDate?: Date,
    selectedMonth?: { month: number; year: number },
    customDates?: { startDate: string; endDate: string }
  ) => {
    // setTimeframe(timeframe);
    setLoading(true);

    // Handle week timeframe with default date
    if (timeframe === "week" && !selectedDate) {
      const defaultDate = getDefaultWeekDate();
      setLoading(false);
      return handleFetchData("week", defaultDate);
    }

    // Store custom range for trend analysis
    if (timeframe === "custom" && customDates) {
      // setCurrentCustomRange(customDates);
    }

    try {
      const params: FetchDataParams = {
        timeframe,
        selectedDate,
        selectedMonth,
        customDates,
      };
      const result = await fetchData(params);

      // Ensure result is always an array
      if (Array.isArray(result)) {
        setData(result);
      } else {
        console.warn("API returned non-array data:", result);
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Handler for species selection changes
  // const handleSpeciesChange = (species: string[]) => {
  //   setSelectedSpecies(species);
  // };

  return (
    <div className="container mx-auto flex flex-col pb-4 gap-10">
    
        <HydrophoneStation onTimeframeChange={handleFetchData} />
     

      {loading && (
        <div className="text-center p-8">
          <div className="inline-flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-gray-500">Loading statistics...</span>
          </div>
        </div>
      )}

      {!loading && data && data.length > 0 && (
        <StatisticsDashboard data={data} />
      )}

      {!loading && data && data.length === 0 && (
        <div className="text-center p-8 text-gray-500">
          No data found for the selected time period
        </div>
      )}

      {!loading && !data && (
        <div className="text-center p-8 text-gray-500">
          Select a time period to view detection statistics
        </div>
      )}

   

     
        <SpeciesVisualization />
     
    </div>
  );
}
