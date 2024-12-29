
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-lg text-gray-600 mb-8">Page Not Found</p>
            <Link
                to="/"
            >
                <Button>
                    Go to Home
                </Button>
            </Link>
        </div>
    );
};

export default NotFoundPage;
