import { DateSelector } from "@/components/DateSelector";
import MonthSelector from "@/components/MonthSelector";
import SpeciesVisualization from "@/components/SpeciesVisualization";
import StatisticsDashboard from "@/components/StaticsDashBoard";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function App() {
  const [data, setData] = useState<any[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<{
    month: number;
    year: number;
  }>({
    month: 7,
    year: 2024,
  });
  const [timeframe, setTimeframe] = useState<"week" | "month">("month");

  useEffect(() => {
    fetchData("month", undefined, { month: 7, year: 2024 });
  }, []);

  const fetchData = async (
    timeframe: "week" | "month",
    selectedDate?: Date,
    selectedMonth?: { month: number; year: number }
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

  return (
    <div className="container mx-auto pb-4 space-y-4">
      <div className="bg-white rounded-lg shadow-md p-6 ">
        <h2 className="text-2xl font-bold mb-4 ">Detection Statistics</h2>

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
        </div>

        {timeframe === "week" && (
          <div className="flex justify-center mt-4 mb-8">
            <DateSelector
              date={selectedDate || undefined}
              minDate={new Date(2024, 0, 1)}
              maxDate={new Date(2024, 6, 31)}
              onDateChange={(date) => {
                if (date) {
                  setSelectedDate(date);
                  fetchData("week", date);
                }
              }}
            />
          </div>
        )}

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

        {data && <StatisticsDashboard data={data} />}

        {!data && (
          <div className="text-center p-8 text-gray-500">
            Select a time period to view detection statistics
          </div>
        )}
      </div>
      <div className="rounded-lg shadow-md px-6 py-2">
        <SpeciesVisualization />
      </div>
    </div>
  );
}
