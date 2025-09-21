import * as React from "react";
import { format, isBefore, isAfter } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date>(date);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate && !isBefore(newDate, minDate) && !isAfter(newDate, maxDate)) {
      setSelectedDate(newDate);
      onDateChange(newDate);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
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
              {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 shadow-lg border-gray-200" align="start">
        <div className="p-4 border-b border-gray-100">
          <h4 className="font-medium text-sm text-gray-900">Select Date</h4>
          <p className="text-xs text-gray-500 mt-1">Choose a date for weekly statistics</p>
        </div>
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
      </PopoverContent>
    </Popover>
  );
}
