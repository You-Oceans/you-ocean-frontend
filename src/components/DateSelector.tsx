import * as React from "react";
import { format, isBefore, isAfter } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";


interface DateSelectorProps {
  date?: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  minDate: Date;
  maxDate: Date;
}

export function DateSelector({
  date = new Date(2024, 6, 1),
  onDateChange,
  minDate = new Date(2024, 0, 1),
  maxDate = new Date(2024, 6, 31),
}: DateSelectorProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(date);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate && !isBefore(newDate, minDate) && !isAfter(newDate, maxDate)) {
      setSelectedDate(newDate);
      onDateChange(newDate);
    }
  };

  return (
    <div className="flex flex-col">
     
      <Button
        variant="outline"
        className={cn(
          "w-[280px] justify-between text-left font-normal bg-white hover:bg-gray-50 border-gray-200 transition-colors",
          !selectedDate && "text-muted-foreground"
        )}
      >
        <div className="flex items-center">
          <CalendarIcon className="mr-3 h-4 w-4 text-gray-500" />
          <span className="text-sm">
            {selectedDate
              ? format(selectedDate, "EEEE, MMMM d, yyyy")
              : "Select a date"}
          </span>
        </div>
      </Button>
      <div className="p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
          disabled={(date) => isBefore(date, minDate) || isAfter(date, maxDate)}
          className="rounded-md"
        />
      </div>
    </div>
  );
}
