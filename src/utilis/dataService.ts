import { getISOWeek } from './dateUtils';

export interface FetchDataParams {
  timeframe: "week" | "month" | "custom";
  selectedDate?: Date;
  selectedMonth?: { month: number; year: number };
  customDates?: { startDate: string; endDate: string };
}

export const fetchData = async (params: FetchDataParams): Promise<any[]> => {
  const { timeframe, selectedDate, selectedMonth, customDates } = params;
  let apiUrl = import.meta.env.VITE_API_FETCHDATA_API;

  if (!apiUrl) {
    console.error("API URL is not defined in .env file");
    throw new Error("API URL is not configured");
  }

  if (timeframe === "week") {
    if (!selectedDate) {
      throw new Error("Selected date is required for week timeframe");
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
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
