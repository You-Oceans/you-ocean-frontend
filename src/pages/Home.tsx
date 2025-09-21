"use client";

import { useEffect, useState } from "react";
import { DateSelector } from "@/components/DateSelector";
import MonthSelector from "@/components/MonthSelector";
import StatisticsDashboard from "@/components/StaticsDashBoard";
import SpeciesVisualization from "@/components/SpeciesVisualization";
import TrendVisualization from "@/components/TrendVisualization";
import { Button } from "@/components/ui/button";
import DateRangeSelector from "@/components/DateRangeSelector";
import { SpeciesSelector } from "@/components/SpeciesSelector";
import AggregatedStats from "@/components/AggregateStats";

export default function App() {
  const [data, setData] = useState<any[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMonth, setSelectedMonth] = useState({ month: 7, year: 2024 });
  const [timeframe, setTimeframe] = useState<"week" | "month" | "custom">(
    "month"
  );
  const [allSpecies, setAllSpecies] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);

  const [customRange, setCustomRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "2024-01-01",
    endDate: "2026-07-31",
  });

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
    setTimeframe(timeframe);
    let apiUrl = import.meta.env.VITE_API_FETCHDATA_API;

    if (!apiUrl) {
      console.error("API URL is not defined in .env file");
      return;
    }

    if (timeframe === "week") {
      if (!selectedDate) {
        const defaultDate = new Date(2024, 6, 1);
        setSelectedDate(defaultDate);
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

  return (
    <div className="container mx-auto pb-4 space-y-4">
      <div className="bg-white rounded-lg shadow-md p-6 ">
        <h2 className="text-2xl font-bold mb-4">Detection Statistics</h2>

        {/* Timeframe Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button
            onClick={() => fetchData("week")}
            variant={timeframe === "week" ? "default" : "outline"}
            className="min-w-32"
          >
            Weekly Statistics
          </Button>

          <Button
            onClick={() => fetchData("month", undefined, selectedMonth)}
            variant={timeframe === "month" ? "default" : "outline"}
            className="min-w-32"
          >
            Monthly Statistics
          </Button>

          <Button
            onClick={() => {
              setTimeframe("custom");
              fetchData("custom", undefined, undefined, customRange);
            }}
            variant={timeframe === "custom" ? "default" : "outline"}
            className="min-w-32"
          >
            Custom Range
          </Button>
        </div>

        {/* Week Picker */}
        {timeframe === "week" && (
          <div className="flex justify-center mt-4 mb-8">
            <DateSelector
              date={selectedDate || undefined}
              minDate={new Date(2024, 0, 1)}
              maxDate={new Date(2026, 6, 31)}
              onDateChange={(date) => {
                if (date) {
                  setSelectedDate(date);
                  fetchData("week", date);
                }
              }}
            />
          </div>
        )}

        {/* Month Picker */}
        {timeframe === "month" && (
          <div className="flex justify-center mt-4 mb-8">
            <MonthSelector
              selectedMonth={selectedMonth}
              onMonthChange={(month, year) => {
                setSelectedMonth({ month, year });
                fetchData("month", undefined, { month, year });
              }}
            />
          </div>
        )}

        {/* Custom Range Picker */}
        {timeframe === "custom" && (
          <div className="flex justify-center mt-4 mb-8">
            <DateRangeSelector
              initialStartDate={customRange.startDate}
              initialEndDate={customRange.endDate}
              onDateRangeChange={(startDate, endDate) => {
                setCustomRange({ startDate, endDate });
                fetchData("custom", undefined, undefined, {
                  startDate,
                  endDate,
                });
              }}
            />
          </div>
        )}

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
        </div>
      )}

      <div className="rounded-lg shadow-md px-6 py-2">
        <SpeciesVisualization />
      </div>
    </div>
  );
}
