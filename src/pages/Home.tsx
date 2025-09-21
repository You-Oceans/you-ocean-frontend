"use client";

import { useEffect, useState } from "react";

// Components
import StatisticsDashboard from "@/components/StaticsDashBoard";
import SpeciesVisualization from "@/components/SpeciesVisualization";
import TrendVisualization from "@/components/TrendVisualization";
import { SpeciesSelector } from "@/components/SpeciesSelector";
import AggregatedStats from "@/components/AggregateStats";
import { HydrophoneStation } from "@/components/HydrophoneStation";

// Utilities
import { fetchData, type FetchDataParams } from "@/utilis/dataService";
import { getDefaultWeekDate } from "@/utilis/dateUtils";
import { extractUniqueSpecies, initializeSelectedSpecies } from "@/utilis/dataProcessing";

export default function App() {
  const [data, setData] = useState<any[] | null>(null);
  const [timeframe, setTimeframe] = useState<"week" | "month" | "custom">(
    "month"
  );
  const [allSpecies, setAllSpecies] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [currentCustomRange, setCurrentCustomRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "2024-01-01",
    endDate: "2026-07-31",
  });

  // Initialize with default month data
  useEffect(() => {
    handleFetchData("month", undefined, { month: 7, year: 2024 });
  }, []);

  // Extract unique species from data and initialize selection
  useEffect(() => {
    if (data && data.length > 0) {
      const species = extractUniqueSpecies(data);
      setAllSpecies(species);
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
    setTimeframe(timeframe);

    // Handle week timeframe with default date
    if (timeframe === "week" && !selectedDate) {
      const defaultDate = getDefaultWeekDate();
      return handleFetchData("week", defaultDate);
    }

    // Store custom range for trend analysis
    if (timeframe === "custom" && customDates) {
      setCurrentCustomRange(customDates);
    }

    try {
      const params: FetchDataParams = {
        timeframe,
        selectedDate,
        selectedMonth,
        customDates,
      };
      const result = await fetchData(params);
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    }
  };

  // Handler for species selection changes
  const handleSpeciesChange = (species: string[]) => {
    setSelectedSpecies(species);
  };

  return (
    <div className="container mx-auto pb-4 space-y-4">
      {/* Hydrophone Station Section */}
      <div className="bg-white  p-6">
        <HydrophoneStation onTimeframeChange={handleFetchData} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 ">
        <h2 className="text-2xl font-bold mb-4">Detection Statistics</h2>

        {data && <StatisticsDashboard data={data} />}

        {!data && (
          <div className="text-center p-8 text-gray-500">
            Select a time period to view detection statistics
          </div>
        )}
      </div>

      {/* Trend Analysis for Custom Date Range */}
      {timeframe === "custom" && data && data.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Trend Analysis</h2>
            <p className="text-gray-500">
              Visualize trends for your selected date range from{" "}
              {currentCustomRange.startDate} to {currentCustomRange.endDate}
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
            startDate={currentCustomRange.startDate}
            endDate={currentCustomRange.endDate}
            selectedSpecies={selectedSpecies}
          />
          <AggregatedStats
            data={data}
            startDate={currentCustomRange.startDate}
            endDate={currentCustomRange.endDate}
            selectedSpecies={selectedSpecies}
          />
        </div>
      )}

      <div className="rounded-lg shadow-md px-6 py-2">
        <SpeciesVisualization />
      </div>
    </div>
  );
}
