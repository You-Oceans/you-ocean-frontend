"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

declare var google: any; // Declare google variable

const Map: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const GOOGLE_MAP_API_KEY = import.meta.env.VITE_API_GOOGLE_MAP_KEY;
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (typeof google !== "undefined") {
        const centerCoords = { lat: 36.7125, lng: -122.1868 };
        const map = new google.maps.Map(mapRef.current as HTMLDivElement, {
          center: centerCoords,
          zoom: 2,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 4px; max-width: 220px; text-align: center;">
              <img src="https://gradpost.ucsb.edu/sites/default/files/2023-11/mbari-banner.jpg"  
                style="width: 100%; height: auto; border-radius: 6px; margin-bottom: 2px;"
                alt="Monterey Bay Aquarium Research Institute" 
              />
              <h3 style="margin: 0 0 4px 0; font-weight: bold;">Monterey Bay Aquarium Research Institute</h3>
              <h4 style="margin: 0 0 6px 0; font-weight: 600; color: #2563eb;">Hydrophone Station</h4>
              <p style="margin: 0 0 8px 0;">Explore marine research data from this location.</p>
              <button 
                style="background: #2563eb; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;"
                id="search-button"
              >
                View Data
              </button>
            </div>
          `,
        });

        const marker = new google.maps.Marker({
          position: centerCoords,
          map,
          title: "Monterey Bay Aquarium Research Institute",
          animation: google.maps.Animation.DROP,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        google.maps.event.addListener(infoWindow, "domready", () => {
          document
            .getElementById("search-button")
            ?.addEventListener("click", () => {
              navigate("/search");
            });
        });

        setMapLoaded(true);
      }
    };

    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_API_KEY}&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      script.onload = loadGoogleMaps;
    } else {
      loadGoogleMaps();
    }
  }, [GOOGLE_MAP_API_KEY, navigate]);

  return (
    <Card className="w-full">
      <CardHeader className="p-3">
        {" "}
        {/* Reduce padding here if needed */}
        <CardTitle className="flex items-center gap-1 text-lg sm:text-xl m-0">
          <Info className="h-5 w-5 shrink-0" />
          Marine Research Data Explorer
        </CardTitle>
        <h4 className="text-md sm:text-lg font-semibold text-primary m-0">
          Hydrophone Station
        </h4>
        <CardDescription className="text-sm sm:text-base m-0">
          This map shows the location of the Monterey Bay Aquarium Research
          Institute. Click on the marker to explore available marine research
          data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="w-full h-[300px] sm:h-[500px] border rounded-lg shadow-md"
          ref={mapRef}
        ></div>

        {mapLoaded && (
          <div className="mt-4 p-3 bg-muted rounded-md flex flex-wrap items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground flex-1">
              Click on the marker and then "View Data" to search through marine
              research data from this location.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto ml-auto"
              onClick={() => navigate("/search")}
            >
              Go to Search
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Map;
