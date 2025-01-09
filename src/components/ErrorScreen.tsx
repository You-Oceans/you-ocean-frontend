import { Button } from "./ui/button";

interface ErrorScreenProps {
  message?: string;
}

export function ErrorScreen({ message = "An error occurred while fetching data." }: ErrorScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className=" p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center">
          <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong.</h2>
          <p className="text-gray-600 text-center mb-6">{message}</p>
          <Button
            onClick={() => window.location.reload()}
            className=" text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}

