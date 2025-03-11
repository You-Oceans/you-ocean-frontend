"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import SpeciesVisualization from "@/components/SpeciesVisualization";
import { DateSelector } from "@/components/DateSelector";
import MonthSelector from "@/components/MonthSelector";
import StatisticsDashboard from "@/components/StaticsDashBoard";

export default function App() {
  const [data, setData] = useState<any[] | null>(null);
  const [showWeekCalendar, setShowWeekCalendar] = useState(false);
  const [showMonthCalendar, setShowMonthCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<{
    month: number;
    year: number;
  } | null>(null);
  const [timeframe, setTimeframe] = useState<string | null>(null);

  const fetchData = async (
    timeframe: "day" | "week" | "month",
    selectedDate?: Date,
    selectedMonth?: { month: number; year: number }
  ) => {
    setTimeframe(timeframe);
    let apiUrl = import.meta.env.VITE_API_FETCHDATA_API; // Fix variable declaration

    if (!apiUrl) {
      console.error("API URL is not defined in .env file");
      return;
    }

    if (timeframe === "week") {
      if (!selectedDate) {
        setShowWeekCalendar(true);
        return;
      }

      const weekNumber = getISOWeek(selectedDate);
      const year = selectedDate.getFullYear();
      apiUrl = `${apiUrl}/data/fetchDataByWeek?weekNumber=${weekNumber}&year=${year}`;
    } else if (timeframe === "month") {
      if (!selectedMonth) {
        setShowMonthCalendar(true);
        return;
      }

      const { month, year } = selectedMonth;
      apiUrl = `${apiUrl}/data/fetchDataByMonth?month=${month}&year=${year}`;
    }

    try {
      const response = await fetch(apiUrl);
      const result = await response.json();
      setData(result.data || []);
      setShowWeekCalendar(false);
      setShowMonthCalendar(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Helper function to get ISO week number
  const getISOWeek = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };

  return (
    <div className="container mx-auto pb-4 space-y-4 ">
      <div className=" rounded-lg shadow-md px-6 py-2">
        <SpeciesVisualization />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Detection Statistics</h2>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button
            onClick={() => setShowWeekCalendar(true)}
            variant={timeframe === "week" ? "default" : "outline"}
            className="min-w-32"
          >
            Weekly Statistics
          </Button>
          <Button
            onClick={() => setShowMonthCalendar(true)}
            variant={timeframe === "month" ? "default" : "outline"}
            className="min-w-32"
          >
            Monthly Statistics
          </Button>
        </div>

        {showWeekCalendar && (
          <div className="flex justify-center mt-4 mb-8">
            <DateSelector
              date={selectedDate || undefined}
              onDateChange={(date) => {
                if (date) {
                  setSelectedDate(date);
                  fetchData("week", date);
                }
              }}
            />
          </div>
        )}

        {showMonthCalendar && (
          <div className="flex justify-center mt-4 mb-8">
            <MonthSelector
              selectedMonth={selectedMonth || undefined}
              onMonthChange={(month, year) => {
                setSelectedMonth({ month, year });
                fetchData("month", undefined, { month, year });
              }}
            />
          </div>
        )}

        {data && <StatisticsDashboard data={data} />}

        {!data && !showWeekCalendar && !showMonthCalendar && (
          <div className="text-center p-8 text-gray-500">
            Select a time period to view detection statistics
          </div>
        )}
      </div>
    </div>
  );
}
