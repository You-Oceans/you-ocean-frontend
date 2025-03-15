import { useState } from "react";

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

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = Number(e.target.value);
    setMonth(newMonth);
    onMonthChange(newMonth, year);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = Number(e.target.value);
    setYear(newYear);
    onMonthChange(month, newYear);
  };

  return (
    <div className="flex space-x-4 items-center">
      <div className="border p-1 space-x-2 px-4 flex items-center">
        <select
          value={month}
          onChange={handleMonthChange}
          className="border rounded p-1 px-4 cursor-pointer"
        >
          {Array.from({ length: 7 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={handleYearChange}
          className="border rounded p-1 px-4 cursor-pointer"
        >
          <option value={2024}>2024</option>
        </select>
      </div>
    </div>
  );
};

export default MonthSelector;
