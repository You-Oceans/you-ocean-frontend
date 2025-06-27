import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, TrendingUp,Clock } from "lucide-react";

export default function ActivityCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Global Activity Card */}
      <Card className="bg-card flex flex-col justify-between gap-6 !p-6">
        <CardHeader className="flex flex-row items-center justify-between !p-0">
          <CardTitle className="text-sm font-medium text-foreground">
            Global Activity
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="!p-0">
          <div className="flex items-end w-full">
            <div className="flex flex-col w-5/12">
              <div className="text-2xl font-semibold text-foreground">15</div>
              <p className="text-xs text-muted-foreground">Species detected</p>
            </div>
            <div className="flex flex-col w-5/12">
              <div className="text-2xl font-semibold text-foreground">15</div>
              <p className="text-xs text-muted-foreground">Active stations</p>
            </div>
            <p className="text-xs text-muted-foreground mt-4 w-2/12">Today</p>
          </div>
         
        </CardContent>
      </Card>

      {/* Trending Species Card */}
      <Card className="bg-card flex flex-col justify-between !p-6">
        <CardHeader className="flex flex-row items-center justify-between !p-0">
          <CardTitle className="text-sm font-medium text-foreground">
            Trending Species
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="!p-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="text-base font-semibold text-foreground">Blue Whales</div>
              <div className="flex items-center space-x-1 text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs font-medium">40%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Most detected this week</p>
          </div>
        </CardContent>
      </Card>

      {/* Personal Summary Card */}
      <Card className="bg-card flex flex-col justify-between !p-6">
        <CardHeader className="flex flex-row items-center justify-between !p-0">
          <CardTitle className="text-sm font-medium text-foreground">
            Personal Summary
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="!p-0">
          <div className="flex items-end w-full ">
            <div className="flex flex-col w-5/12 gap-1.5">
              <div className="text-2xl font-semibold text-foreground">2</div>
              <p className="text-xs text-muted-foreground">Alert triggered</p>
            </div>
            <div className="flex flex-col w-5/12 gap-1.5 ">
              <div className="text-2xl font-semibold text-foreground">2</div>
              <p className="text-xs text-muted-foreground">Upload completed</p>
            </div>
            <p className="text-xs text-muted-foreground mt-4 w-2/12">Today</p>
          </div>
         
        </CardContent>
      </Card>
    </div>
  );
}
