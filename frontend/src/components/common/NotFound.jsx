import React from 'react';
import { Link } from 'react-router-dom'; // Remove if not using React Router

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
      <h1 className="text-7xl font-bold text-blue-600">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold mt-4 text-gray-800">Page Not Found</h2>
      <p className="mt-2 text-gray-600 max-w-md">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full shadow-md transition duration-300">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;