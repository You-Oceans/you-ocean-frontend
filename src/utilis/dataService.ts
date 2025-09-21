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
    console.log("Fetching data from:", apiUrl);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("API Response:", result);
    
    // Ensure we always return an array
    const data = result.data || result || [];
    
    if (!Array.isArray(data)) {
      console.warn("API response is not an array:", data);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    // Return empty array instead of throwing to prevent crashes
    return [];
  }
};
