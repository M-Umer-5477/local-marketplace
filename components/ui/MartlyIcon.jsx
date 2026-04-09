import React from 'react';

export default function MartLyIcon({ className = "w-12 h-12" }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Saffron Orange App Background */}
      <rect width="100" height="100" rx="24" fill="#F97316" />
      
      {/* Shopping Bag Handle */}
      <path 
        d="M35 35 C 35 18, 65 18, 65 35" 
        stroke="#FFFBF7" 
        strokeWidth="6" 
        strokeLinecap="round" 
      />
      
      {/* The 'M' / Bag Body */}
      <path 
        d="M25 35 V 65 C 25 70.5 29.5 75 35 75 H 65 C 70.5 75 75 70.5 75 65 V 35" 
        stroke="#FFFBF7" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* The Geometric 'M' Fold inside the bag */}
      <path 
        d="M25 35 L 50 55 L 75 35" 
        stroke="#FFFBF7" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Subtle central dot for the "Location/Local" vibe */}
      <circle cx="50" cy="62" r="3.5" fill="#FFFBF7" />
    </svg>
  );
}