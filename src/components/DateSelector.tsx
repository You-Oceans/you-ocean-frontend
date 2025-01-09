import * as React from "react";
import { format, getMonth, getYear, setMonth, setYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface DateSelectorProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  startYear?: number;
  endYear?: number;
}

export function DateSelector({
  date = new Date(),
  onDateChange,
  startYear = getYear(new Date()) - 100,
  endYear = getYear(new Date()) + 100,
}: DateSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date>(date);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const availableYears = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  const handleMonthSelect = (month: string) => {
    const newDate = setMonth(tempDate, monthNames.indexOf(month));
    setTempDate(newDate);
  };

  const handleYearSelect = (year: string) => {
    const newDate = setYear(tempDate, parseInt(year));
    setTempDate(newDate);
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setTempDate(newDate);
    }
  };

  const handleConfirm = () => {
    onDateChange(tempDate); 
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !tempDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {tempDate ? format(tempDate, "PPP") : <span>Select date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex justify-between p-2">
          <Select
            onValueChange={handleMonthSelect}
            value={monthNames[getMonth(tempDate)]}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={handleYearSelect}
            value={getYear(tempDate).toString()}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Calendar
          mode="single"
          selected={tempDate}
          onSelect={handleDateSelect}
          initialFocus
          month={tempDate}
          onMonthChange={setTempDate}
        />

        <div className="flex justify-end p-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} className="ml-2">
            Confirm
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
