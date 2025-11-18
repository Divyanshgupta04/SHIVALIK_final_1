import React from "react";
import { Link } from "react-router-dom";
import not from "../assets/not.webp";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      {/* Image */}
      <img
        src={not}
        alt="Not Found"
        className="w-64 h-64 object-contain mb-6 animate-bounce-slow"
      />

      {/* Text */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 text-center">
        Oops! We are on the wrong track 🚧
      </h1>
      <p className="text-gray-600 text-lg text-center">
        Well, this is awkward.  
      </p>
      <p className="text-gray-500 text-md text-center mb-8">
        The page you are looking for does not exist.
      </p>

      {/* Button */}
      <Link to="/">
        <button className="px-6 py-3 rounded-2xl bg-[#008585] text-white font-semibold shadow-md transition-all duration-300 hover:bg-[#006666] hover:scale-105 hover:shadow-lg">
          Go Back Home
        </button>
      </Link>
    </div>
  );
}

export default NotFound;
