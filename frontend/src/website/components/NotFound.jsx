import React from 'react'
import { Link } from "react-router-dom"

function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <h1 className="text-4xl font-bold text-[#eba312]">404 - Page Not Found</h1>
            <p className="text-lg mt-3">Oops! The page you're looking for doesn't exist.</p>
            <Link to="/" className="mt-5 px-4 py-2 bg-amber-500 text-white hover:bg-amber-600 text-white rounded-md">
                Go Back Home
            </Link>
        </div>
    );
}

export default NotFound