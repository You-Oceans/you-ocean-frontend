import { useState } from "react";
import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MonthSelectorProps {
  selectedMonth: { month: number; year: number };
  onMonthChange: (month: number, year: number) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  onMonthChange,
}) => {
  const [month, setMonth] = useState(selectedMonth.month);
  const [year, setYear] = useState(selectedMonth.year);

  const handleMonthChange = (value: string) => {
    const newMonth = Number(value);
    setMonth(newMonth);
    onMonthChange(newMonth, year);
  };

  const handleYearChange = (value: string) => {
    const newYear = Number(value);
    setYear(newYear);
    onMonthChange(month, newYear);
  };

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
  ];

  const selectedMonthLabel = months.find(m => m.value === month)?.label || "January";

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center space-x-1 p-1 bg-gray-50 rounded-lg border border-gray-200">
        <Calendar className="w-4 h-4 text-gray-500 ml-3" />
        <span className="text-sm font-medium text-gray-700 px-2">
          {selectedMonthLabel} {year}
        </span>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
            Month
          </label>
          <Select value={month.toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[140px] bg-white border-gray-200 hover:border-gray-300 focus:border-blue-400 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
            Year
          </label>
          <Select value={year.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[100px] bg-white border-gray-200 hover:border-gray-300 focus:border-blue-400 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default MonthSelector;
