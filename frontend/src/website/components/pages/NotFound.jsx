import { Link } from 'react-router-dom';
import { memo } from 'react';

const NotFound = memo(() => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#000000] px-4 py-12 pt-[8rem] md:pt-[10rem]">
            <div className="text-center">
                <h1 className="text-6xl md:text-8xl font-bold text-[#eba312] mb-4">404</h1>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                    Page Not Found
                </h2>
                <p className="text-white mb-8 max-w-md mx-auto">
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="space-x-4">
                    <Link
                        to="/"
                        className="inline-block bg-[#eba312] text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors duration-300"
                    >
                        Go to Homepage
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-block border-2 border-[#eba312] text-[#eba312] px-6 py-3 rounded-lg font-semibold hover:bg-[#eba312] hover:text-white transition-colors duration-300"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
});

NotFound.displayName = 'NotFound';
export default NotFound;