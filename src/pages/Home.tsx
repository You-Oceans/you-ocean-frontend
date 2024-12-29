
import { useAuthStore } from '../hooks/useAuthStore';
import LogoutButton from '@/components/LogoutButton';
const App = () => {
 const {user}=useAuthStore()
  return (
    <div>
        <div>
          <h1>Welcome, {user?.name}</h1>
          <LogoutButton/>
        </div>
     
    </div>
  );
};

export default App;
