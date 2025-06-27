import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "@/components/ui/sonner";
function App() {
  return (
    <div className="w-full h-[calc(100vh-64px)]">
      <AppRoutes />
      <Toaster />
    </div>
  );
}

export default App;
