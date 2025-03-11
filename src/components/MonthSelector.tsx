import { useState } from "react";

interface MonthSelectorProps {
  selectedMonth?: { month: number; year: number };
  onMonthChange: (month: number, year: number) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  onMonthChange,
}) => {
  const [month, setMonth] = useState(
    selectedMonth?.month || new Date().getMonth() + 1
  );
  const [year, setYear] = useState(
    selectedMonth?.year || new Date().getFullYear()
  );

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
        {/* Month Selector */}
        <select
          value={month}
          onChange={handleMonthChange}
          className="border rounded p-1 px-4 cursor-pointer"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        {/* Year Selector */}
        <select
          value={year}
          onChange={handleYearChange}
          className="border rounded p-1 px-4 cursor-pointer"
        >
          {Array.from(
            { length: 5 },
            (_, i) => new Date().getFullYear() - i
          ).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Select Button */}
      <button
        onClick={() => onMonthChange(month, year)}
        className="bg-primary text-white px-8 py-1 rounded hover:bg-primary-dark transition"
      >
        Select
      </button>
    </div>
  );
};

export default MonthSelector;
