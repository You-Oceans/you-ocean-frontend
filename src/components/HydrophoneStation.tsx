import { Bell, Save, MapPin, Radio, Volume2, Clock, Calendar, Edit } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DateSelector } from "@/components/DateSelector";
import MonthSelector from "@/components/MonthSelector";
import DateRangeSelector from "@/components/DateRangeSelector";

interface HydrophoneStationProps {
  stationName?: string;
  status?: "Active" | "Inactive" | "Maintenance";
  stationType?: string;
  location?: string;
  topSpecies?: string;
  totalCalls?: string;
  noiseLevel?: string;
  lastUpdated?: string;
  operator?: string;
  coordinates?: string;
  onTimeframeChange?: (
    timeframe: "week" | "month" | "custom",
    selectedDate?: Date,
    selectedMonth?: { month: number; year: number },
    customDates?: { startDate: string; endDate: string }
  ) => void;
}

export function HydrophoneStation({
  stationName = "Hydrophone Station",
  status = "Active",
  stationType = "Permanent Hydrophone",
  location = "California Current, Northeast Pacific",
  topSpecies = "Blue Whale (162 calls)",
  totalCalls = "382 calls",
  noiseLevel = "Avg 79 dB",
  lastUpdated = "2 hours ago",
  operator = "MBARI",
  coordinates = "36.785° N, 122.147° W",
  onTimeframeChange,
}: HydrophoneStationProps) {
  // Local state for timeframe controls
  const [activeTab, setActiveTab] = useState("monthly");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMonth, setSelectedMonth] = useState({ month: 7, year: 2024 });
  const [customRange, setCustomRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "2024-01-01",
    endDate: "2026-07-31",
  });

  // Dialog state management
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [isMonthDialogOpen, setIsMonthDialogOpen] = useState(false);
  const [isRangeDialogOpen, setIsRangeDialogOpen] = useState(false);

  // Helper functions to format current selections
  const getCurrentWeekDisplay = () => {
    if (selectedDate) {
      return selectedDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
    // Show default date if none selected
    const defaultDate = new Date(2024, 6, 1);
    return defaultDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getCurrentMonthDisplay = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    return `${monthNames[selectedMonth.month - 1]} ${selectedMonth.year}`;
  };

  const getCurrentRangeDisplay = () => {
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    return `${formatDate(customRange.startDate)} - ${formatDate(customRange.endDate)}`;
  };

  // Handle tab changes and trigger data fetch
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    switch (value) {
      case "weekly":
        if (selectedDate) {
          onTimeframeChange?.("week", selectedDate);
        } else {
          // Set default date and fetch
          const defaultDate = new Date(2024, 6, 1);
          setSelectedDate(defaultDate);
          onTimeframeChange?.("week", defaultDate);
        }
        break;
      case "monthly":
        onTimeframeChange?.("month", undefined, selectedMonth);
        break;
      case "custom":
        onTimeframeChange?.("custom", undefined, undefined, customRange);
        break;
    }
  };
  return (
    <div className="flex w-full max-w-7xl mx-auto  border pl-5 rounded-md bg-background gap-6">
      {/* Left Panel - Station Information */}
      <div className="flex-1  space-y-6">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4 px-0">
            {/* Header with Logo and Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center">
                  <Radio className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground leading-tight">
                    {stationName}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    
                     <span className="text-sm text-green-700"> {status}</span>
                   
                    <span className="text-sm text-muted-foreground">{stationType}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Set Alert
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-slate-900 text-white border-slate-900 hover:bg-slate-800">
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-0 space-y-6">
            {/* Location */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Location</h3>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{location}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-8">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">Top species</h4>
                <p className="text-sm text-muted-foreground">{topSpecies}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">Total calls (last 7d)</h4>
                <p className="text-sm text-muted-foreground">{totalCalls}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">Noise level</h4>
                <div className="flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{noiseLevel}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">Last Updated</h4>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{lastUpdated}</p>
                </div>
              </div>
            </div>

            {/* Tabs for Stats */}
            <div className="pt-4">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="grid w-fit grid-cols-3 h-10">
                    <TabsTrigger value="weekly">
                      Weekly Stats
                    </TabsTrigger>
                    <TabsTrigger value="monthly">
                      Monthly Stats
                    </TabsTrigger>
                    <TabsTrigger value="custom">
                      Custom range
                    </TabsTrigger>
                  </TabsList>

                  {/* Current Selection Display */}
                  <div className="flex items-center gap-2">
                    {activeTab === "weekly" && (
                      <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2 text-xs">
                            <Calendar className="w-3 h-3" />
                            {getCurrentWeekDisplay()}
                            <Edit className="w-3 h-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Select Week</DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-center p-4">
                            <DateSelector
                              date={selectedDate || undefined}
                              minDate={new Date(2024, 0, 1)}
                              maxDate={new Date(2026, 6, 31)}
                              onDateChange={(date) => {
                                if (date) {
                                  setSelectedDate(date);
                                  onTimeframeChange?.("week", date);
                                  setIsDateDialogOpen(false);
                                }
                              }}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {activeTab === "monthly" && (
                      <Dialog open={isMonthDialogOpen} onOpenChange={setIsMonthDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2 text-xs">
                            <Calendar className="w-3 h-3" />
                            {getCurrentMonthDisplay()}
                            <Edit className="w-3 h-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Select Month</DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-center p-4">
                            <MonthSelector
                              selectedMonth={selectedMonth}
                              onMonthChange={(month, year) => {
                                setSelectedMonth({ month, year });
                                onTimeframeChange?.("month", undefined, { month, year });
                                setIsMonthDialogOpen(false);
                              }}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {activeTab === "custom" && (
                      <Dialog open={isRangeDialogOpen} onOpenChange={setIsRangeDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2 text-xs">
                            <Calendar className="w-3 h-3" />
                            {getCurrentRangeDisplay()}
                            <Edit className="w-3 h-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Select Custom Range</DialogTitle>
                          </DialogHeader>
                          <div className="p-4">
                            <DateRangeSelector
                              initialStartDate={customRange.startDate}
                              initialEndDate={customRange.endDate}
                              onDateRangeChange={(startDate, endDate) => {
                                setCustomRange({ startDate, endDate });
                                onTimeframeChange?.("custom", undefined, undefined, {
                                  startDate,
                                  endDate,
                                });
                                setIsRangeDialogOpen(false);
                              }}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Map */}
      <div className="w-96 bg-slate-100 relative rounded-xl overflow-hidden border border-border">
        {/* Map placeholder */}
        <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-300 relative">
          {/* Hydrophone marker */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center shadow-lg">
              <Radio className="w-6 h-6 text-white" />
            </div>
          </div>
          
          {/* Map controls overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Radio className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium text-foreground">Operator</span>
                    </div>
                    <p className="text-muted-foreground">{operator}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium text-foreground">Coordinates</span>
                    </div>
                    <p className="text-muted-foreground">{coordinates}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
