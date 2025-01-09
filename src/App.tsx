import "./App.css";

import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "./components/ui/sonner";
function App() {
  return (
    <div className=" bg-gradient-to-br from-blue-50 to-indigo bg-gray-50">
      <AppRoutes />
      <Toaster />
    </div>
  );
}

export default App;
