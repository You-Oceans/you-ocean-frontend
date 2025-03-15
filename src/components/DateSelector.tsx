import * as React from "react";
import {
  format,
  getMonth,
  getYear,
  setMonth,
  setYear,
  isBefore,
  isAfter,
} from "date-fns";
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
}

export function DateSelector({
  date = new Date(2024, 6, 1),
  onDateChange,
}: DateSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date>(date);

  const allowedMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
  ];

  const startDate = new Date(2024, 0, 1); 
  const endDate = new Date(2024, 6, 31); 
  const isDateValid =
    !isBefore(tempDate, startDate) && !isAfter(tempDate, endDate);

  const handleMonthSelect = (month: string) => {
    const newDate = setMonth(tempDate, allowedMonths.indexOf(month));
    if (!isBefore(newDate, startDate) && !isAfter(newDate, endDate)) {
      setTempDate(newDate);
    }
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (
      newDate &&
      !isBefore(newDate, startDate) &&
      !isAfter(newDate, endDate)
    ) {
      setTempDate(newDate);
    }
  };

  const handleConfirm = () => {
    if (!isBefore(tempDate, startDate) && !isAfter(tempDate, endDate)) {
      onDateChange(tempDate);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[200px] lg:w-[240px] justify-start text-left font-normal",
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
            value={allowedMonths[getMonth(tempDate)]}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {allowedMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(year) =>
              setTempDate(setYear(tempDate, parseInt(year)))
            }
            value={getYear(tempDate).toString()} // Ensure it's a string
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {[2024].map((year) => (
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
          disabled={(date) =>
            isBefore(date, startDate) || isAfter(date, endDate)
          }
        />

        <div className="flex justify-end p-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={!isDateValid}
            variant="default"
            onClick={handleConfirm}
            className="ml-2"
          >
            Confirm
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
