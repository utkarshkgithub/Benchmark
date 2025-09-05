// components/Error.jsx
import React from "react";
import { Link } from "react-router-dom";

function Error() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      <h1 className="text-9xl font-bold text-indigo-600">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-800">
        Page Not Found
      </h2>
      <p className="mt-2 text-gray-600 max-w-md">
        Oops! The page you are looking for doesn’t exist or has been moved.
      </p>

      <Link
        to="/"
        className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
}

export default Error;
