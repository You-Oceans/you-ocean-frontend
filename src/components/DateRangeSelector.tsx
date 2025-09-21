"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"

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

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-start sm:items-end">
      <div className="flex flex-col space-y-2">
        <label htmlFor="start-date" className="text-sm font-medium text-gray-700">
          Start Date
        </label>
        <input
          id="start-date"
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className="border rounded p-1 px-4 cursor-pointer"
          min="2024-01-01"
          max="2026-07-31"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="end-date" className="text-sm font-medium text-gray-700">
          End Date
        </label>
        <input
          id="end-date"
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className="border rounded p-1 px-4 cursor-pointer"
          min="2024-01-01"
          max="2024-07-31"
        />
      </div>

      <Button onClick={handleSubmit} className="font-medium py-4 px-4 rounded transition-colors">
        Apply Range
      </Button>
    </div>
  )
}

export default DateRangeSelector
