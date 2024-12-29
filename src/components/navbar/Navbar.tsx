import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
             <Link to='/'> <span className="ml-2 text-xl font-bold text-gray-800">YOU_OCEANS</span></Link>
            </div>
          </div>
 

          <div className='flex items-center ' >
            <ul className='flex items-center  space-x-24'>
              <li>Home</li>
              <li>About</li>
              <li>Contact</li>
              <li>FAQ</li>
            </ul>
            
          </div>
            

          <div className="flex items-center">
            {user?.name && user?.profileImage ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 bg-white text-gray-800 hover:text-gray-500 focus:outline-none"
                >
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="h-12 w-12 rounded-full"
                  />
                  <div className=''>
                  <div className="font-medium text-start">{user.name}</div>
                  <div className="font-xs">{user.email}</div>
                  </div>
                  <svg
                    className={`w-5 h-5 transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
               
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <button
                      onClick={() => navigate('/profile')}
                      className="block w-full px-4 py-2 text-gray-700 text-left hover:bg-gray-100"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => navigate('/edit-profile')}
                      className="block w-full px-4 py-2 text-gray-700 text-left hover:bg-gray-100"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2  text-left hover:bg-red-100 text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/signup')}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primaryHover"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
