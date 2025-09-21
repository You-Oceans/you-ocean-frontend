"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateRangeSelectorProps {
  initialStartDate?: string
  initialEndDate?: string
  onDateRangeChange?: (startDate: string, endDate: string) => void
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  initialStartDate = new Date().toISOString().split("T")[0],
  initialEndDate = new Date().toISOString().split("T")[0],
  onDateRangeChange,
}) => {
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)
  const navigate = useNavigate();


  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value)
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value)
  }

  const handleSubmit = () => {
    if (onDateRangeChange) {
      onDateRangeChange(startDate, endDate)
    } else {
        navigate(
            `/data/fetchByCustomRange?startDate=${startDate}&endDate=${endDate}`
          );
    }
  }

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-white rounded-lg">
      {/* Header */}
      <div className="flex items-center space-x-2 text-center">
        <Calendar className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-medium text-gray-900">Custom Date Range</h3>
      </div>

      {/* Selected Range Display */}
      <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
        <span className="text-sm font-medium text-gray-700">
          {formatDisplayDate(startDate)}
        </span>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">
          {formatDisplayDate(endDate)}
        </span>
      </div>

      {/* Date Inputs */}
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="start-date" className="text-xs font-medium text-gray-600 uppercase tracking-wider">
            Start Date
          </Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="w-[160px] bg-white border-gray-200 hover:border-gray-300 focus:border-blue-400 transition-colors"
            min="2024-01-01"
            max="2026-07-31"
          />
        </div>

        <div className="flex items-center justify-center pt-6">
          <ArrowRight className="w-4 h-4 text-gray-300" />
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="end-date" className="text-xs font-medium text-gray-600 uppercase tracking-wider">
            End Date
          </Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="w-[160px] bg-white border-gray-200 hover:border-gray-300 focus:border-blue-400 transition-colors"
            min="2024-01-01"
            max="2026-07-31"
          />
        </div>
      </div>

      {/* Apply Button */}
      <Button 
        onClick={handleSubmit} 
        className="w-full max-w-[200px] bg-slate-900 hover:bg-slate-800 text-white transition-colors"
        size="lg"
      >
        Apply Date Range
      </Button>
    </div>
  )
}

export default DateRangeSelector
