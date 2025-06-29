import React, { useState } from "react";
import { Waves, Fish, Upload, Plus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
interface TabType {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

interface StationData {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  location: string;
  recentActivity: string;
  logo: string;
}

interface AlertData {
  id: string;
  species: string;
  station: string;
  status: "Active" | "Paused";
  condition: string;
}
export default function AlertsAndStations() {
  const [activeTab, setActiveTab] = useState("stations");

  const tabs: TabType[] = [
    {
      id: "stations",
      label: "Saved Stations",
      icon: <Waves className="w-5 h-5" />,
    },
    {
      id: "species",
      label: "Saved Species",
      icon: <Fish className="w-5 h-5" />,
    },
    {
      id: "data",
      label: "Uploaded Data",
      icon: <Upload className="w-5 h-5" />,
    },
  ];

  const stationData: StationData[] = [
    {
      id: "1",
      name: "Hydrophone Station",
      status: "Active",
      location: "California Current, Northeast Pacific",
      recentActivity: "3 species detected today",
      logo: "/public/Vector (1).svg", 
    },
    {
      id: "2",
      name: "Hydrophone Station",
      status: "Active",
      location: "California Current, Northeast Pacific",
      recentActivity: "3 species detected today",
      logo: "/public/Vector (1).svg",
    },
    {
      id: "3",
      name: "Hydrophone Station",
      status: "Active",
      location: "California Current, Northeast Pacific",
      recentActivity: "3 species detected today",
      logo: "/public/Vector (1).svg",
    },
  ];
  const alertData: AlertData[] = [
    {
      id: "1",
      species: "Humpback Whale",
      station: "Monterey Bay Station",
      status: "Active",
      condition: "> 100 calls/day",
    },
    {
      id: "2",
      species: "Humpback Whale",
      station: "Monterey Bay Station",
      status: "Paused",
      condition: "> 100 calls/day",
    },
    {
      id: "3",
      species: "Humpback Whale",
      station: "Monterey Bay Station",
      status: "Active",
      condition: "> 100 calls/day",
    },
  ];
  return (
    <div className="flex flex-row gap-3">
      <div className="w-2/3 rounded-xl border overflow-hidden ">
        <section className="border-b ">
          <div className="flex flex-row items-center">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-row items-center gap-2.5 cursor-pointer border-r p-5 ${
                  activeTab === tab.id ? "" : "text-muted-foreground"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="flex flex-col gap-2 p-4">
          {stationData.map((station) => (
            <Link to={`/stations/${station.id}`}>
            <div
              key={station.id}
              className={`flex flex-col gap-3 p-2.5  ${
                station.id === "3" ? "" : "border-b"
              }`}
            >
              <section className="flex flex-row items-center justify-between">
                <section className="flex flex-row items-center gap-2.5">
                  <img
                    src="./mbariLogo.svg"
                    alt="mbari-logo"
                    className="w-10 h-10 rounded-full"
                  />
                  <section className="flex flex-col gap-1">
                    <span className="text-base font-medium">
                      {station.name}
                    </span>
                    <section className="flex flex-row items-center gap-2 ">
                      <span className="text-sm font-normal text-[#248600]">
                        {station.status === "Active" ? "Active" : "Inactive"}
                      </span>
                      <span className="text-sm font-extralight text-muted-foreground opacity-45">
                        |
                      </span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {station.location}
                      </span>
                    </section>
                  </section>
                </section>
                <MoreHorizontal className="w-5 h-5" />
              </section>
              <section className="flex flex-row items-center gap-2">
                <span className="text-sm font-normal text-muted-foreground">
                  Recent Activity:
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {station.recentActivity}
                </span>
                <span className="text-sm font-normal text-muted-foreground"></span>
              </section>
            </div>
            </Link>
          ))}
        </section>
      </div>
      <div className="w-1/3 rounded-xl border overflow-hidden">
        <section className="border-b p-4 flex flex-row items-center justify-between">
          <section>
            <p className="text-base font-medium">Active Alerts</p>
            <p className="text-sm font-normal text-muted-foreground">
              You have{" "}
              <span className="text-sm font-medium">3 active alerts</span>
            </p>
          </section>
          <section>
            <Button variant="outline" className="w-full">
              Add Alert
            </Button>
          </section>
        </section>
        <section className="flex flex-col gap-3 p-4">
          {alertData.map((alert) => (
            <div
              key={alert.id}
              className={`flex flex-col gap-3 p-3 ${
                alert.id === "3" ? "" : "border-b"
              }`}
            >
              <section className="flex flex-row items-start justify-between">
                <section className="flex flex-col">
                  <span className="text-sm font-medium text-card-foreground">
                    {alert.species}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {alert.station}
                  </span>
                </section>
                <MoreHorizontal className="w-5 h-5 text-muted-foreground mt-1" />
              </section>

              <section className="flex flex-row gap-3">
                <div className="flex flex-row items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-md text-sm font-medium border ${
                      alert.status === "Active"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-orange-50 text-orange-700 border-orange-200"
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>

                <div className="flex flex-row items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-normal text-muted-foreground">
                    Email me when {alert.condition}
                  </span>
                </div>
              </section>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
