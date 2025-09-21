import WelcomeBanner from "./components/WelcomeBanner"; 
import ActivityCards from "./components/ActivityCards";
import AlertsAndStations from "./components/AlertsAndStations";

export default function Dashboard() {
  return (
    <div className="px-4 lg:px-32 py-6 lg:py-16 flex flex-col gap-6">
      <WelcomeBanner />
      <ActivityCards />
      <AlertsAndStations />
    </div>
  );
}
