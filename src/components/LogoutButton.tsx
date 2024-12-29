
import { useAuthStore } from "@/hooks/useAuthStore";
import { Button } from "./ui/button";
export default function LogoutButton() {
    const {logout}=useAuthStore()
  return <Button onClick={logout}>Logout</Button>;
}
