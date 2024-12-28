
import { useNavigate } from 'react-router-dom';


export function Navbar() {
    const navigate = useNavigate();
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="ml-2 text-xl font-bold text-gray-800">YOU_OCEAN</span>
            </div>
            
          </div>
          <div className="sm:hidden flex items-center">
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="hidden sm:flex sm:items-center">
            <button
                onClick={()=>{
                    navigate('/signup')
                }}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryHover"
              >
                Sign In
              </button>
          </div>
        </div>
      </div>

    </nav>
  );
}