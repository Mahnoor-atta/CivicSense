import React from 'react';

/**
 * Hand-drawn style SVG doodles matching the soft, citizen-centric aesthetic.
 * Colors utilize Sage Green (#8DA399), Soft Lavender (#6B6A75), and subtle warm tints.
 */

export const DoodleCivicLogo: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-6 h-6',
  color = '#8DA399',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="2.3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Triangular pediment / roof */}
    <path
      d="M24 7L6 18H42L24 7Z"
      fill={color}
      fillOpacity="0.2"
    />
    {/* Architrave / beam under pediment */}
    <path d="M8 18H40" />
    <path d="M10 21H38" />

    {/* 4 Classical Civic Institution Pillars */}
    <path d="M13 21V35" />
    <path d="M19 21V35" />
    <path d="M29 21V35" />
    <path d="M35 21V35" />

    {/* Center civic star / emblem */}
    <path
      d="M24 23.5L25.2 26.8H28.6L25.8 28.8L26.9 32L24 30L21.1 32L22.2 28.8L19.4 26.8H22.8L24 23.5Z"
      fill={color}
      fillOpacity="0.35"
      strokeWidth="1.2"
    />

    {/* Base steps */}
    <path d="M9 35H39" />
    <path d="M6 39H42" />
    <path d="M4 42H44" />
  </svg>
);

export const DoodleSprout: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-6 h-6',
  color = '#8DA399',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Ground curve */}
    <path d="M8 40C16 38.5 32 38.5 40 40" strokeDasharray="1 1" />
    {/* Stem */}
    <path d="M24 39C24 32 23.5 24 25 17" />
    {/* Left leaf */}
    <path
      d="M24.5 24C19 21 12 23 11 29C17 31 23 27 24.5 24Z"
      fill={color}
      fillOpacity="0.18"
    />
    {/* Right leaf */}
    <path
      d="M24.8 19C29 14 37 15 38 21C32 24 26 21 24.8 19Z"
      fill={color}
      fillOpacity="0.25"
    />
  </svg>
);

export const DoodleHouse: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-6 h-6',
  color = '#8DA399',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="2.3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Roof */}
    <path
      d="M10 22L24 10L38 22"
      fill={color}
      fillOpacity="0.12"
    />
    {/* Chimney */}
    <path d="M31 16V12H35V19.5" />
    {/* Chimney puff */}
    <path d="M34 8C33 6.5 36 6 36 4.5" strokeOpacity="0.7" />
    {/* Base */}
    <path d="M14 22V38C14 39 15 40 16 40H32C33 40 34 39 34 38V22" />
    {/* Door */}
    <path d="M21 40V30C21 28.5 27 28.5 27 30V40" fill={color} fillOpacity="0.2" />
    {/* Little window */}
    <circle cx="24" cy="19" r="2.5" fill={color} fillOpacity="0.3" />
  </svg>
);

export const DoodleLamp: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-6 h-6',
  color = '#8DA399',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Post */}
    <path d="M24 42V18" />
    <path d="M19 42H29" />
    {/* Lantern hood */}
    <path d="M18 18H30L27 12H21L18 18Z" fill={color} fillOpacity="0.15" />
    <path d="M20 18L21 24H27L28 18" />
    {/* Little finial */}
    <path d="M24 12V9" />
    {/* Glow rays */}
    <path d="M13 18C15 19 15 21 14 22" strokeDasharray="1 2" strokeOpacity="0.8" />
    <path d="M35 18C33 19 33 21 34 22" strokeDasharray="1 2" strokeOpacity="0.8" />
  </svg>
);

export const DoodlePothole: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-6 h-6',
  color = '#8DA399',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="2.3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Road surface */}
    <path d="M7 26C11 25.5 17 26 21 26" strokeDasharray="2 3" />
    <path d="M31 26C35 26 40 25.5 43 26" strokeDasharray="2 3" />
    {/* Pothole crater */}
    <path
      d="M14 27C14 23 20 22 26 22C32 22 36 24 35 28C34 32 28 34 22 34C16 34 14 30 14 27Z"
      fill={color}
      fillOpacity="0.22"
    />
    {/* Crack lines */}
    <path d="M21 28L18 31" />
    <path d="M27 26L31 30" />
    <path d="M24 33L25 36" />
  </svg>
);

export const DoodleTrashBin: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-6 h-6',
  color = '#8DA399',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Lid handle */}
    <path d="M21 11C21 9.5 27 9.5 27 11" />
    {/* Lid */}
    <path d="M12 14C20 13.5 28 13.5 36 14" />
    {/* Bin body */}
    <path
      d="M15 16L17 38C17 39 18 40 19 40H29C30 40 31 39 31 38L33 16"
      fill={color}
      fillOpacity="0.12"
    />
    {/* Vertical ribs */}
    <path d="M21 20V34" strokeDasharray="1 2" />
    <path d="M27 20V34" strokeDasharray="1 2" />
  </svg>
);

export const DoodleWaterDrop: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-6 h-6',
  color = '#8DA399',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Drop */}
    <path
      d="M24 10C24 10 14 24 14 31C14 36.5 18.5 41 24 41C29.5 41 34 36.5 34 31C34 24 24 10 24 10Z"
      fill={color}
      fillOpacity="0.2"
    />
    {/* Inner highlight */}
    <path d="M20 31C20 27 22 23 24 19" strokeOpacity="0.7" />
  </svg>
);

export const DoodleSparkle: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-5 h-5',
  color = '#8DA399',
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M16 3C16 11 19 13 27 16C19 19 16 21 16 29C16 21 13 19 5 16C13 13 16 11 16 3Z"
      fill={color}
      fillOpacity="0.25"
    />
  </svg>
);

export const DoodleMapPin: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-6 h-6',
  color = '#8DA399',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="2.3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Pin shape */}
    <path
      d="M24 42C24 42 35 29 35 19C35 12.9 30.1 8 24 8C17.9 8 13 12.9 13 19C13 29 24 42 24 42Z"
      fill={color}
      fillOpacity="0.18"
    />
    {/* Inner ring */}
    <circle cx="24" cy="18" r="4" fill={color} fillOpacity="0.4" />
    {/* Shadow oval */}
    <ellipse cx="24" cy="43" rx="8" ry="2.5" strokeOpacity="0.4" strokeDasharray="2 2" />
  </svg>
);

export const DoodleCheckCircle: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-6 h-6',
  color = '#8DA399',
}) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Imperfect hand-drawn circle */}
    <path
      d="M36 19C35.5 28 29 36 19 36C9.5 36 4 28 4.5 19C5 9.5 13 4 22 4C27 4 32 7 35 11"
      fill={color}
      fillOpacity="0.12"
    />
    {/* Check mark */}
    <path d="M12 20L18 26L29 13" />
  </svg>
);

export const DoodleHeart: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-5 h-5',
  color = '#8DA399',
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M16 28C14 26 5 19 5 12C5 7.5 8.5 4 13 4C14.8 4 16 5 16 5C16 5 17.2 4 19 4C23.5 4 27 7.5 27 12C27 19 18 26 16 28Z"
      fill={color}
      fillOpacity="0.22"
    />
  </svg>
);

export const DoodleSquiggleUnderline: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-28 h-3',
  color = '#8DA399',
}) => (
  <svg
    viewBox="0 0 120 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path d="M3 8C20 3 40 10 60 7C80 4 100 9 117 6" />
  </svg>
);

export const DoodlePaperPlane: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-5 h-5',
  color = '#8DA399',
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M28 4L4 14L15 17L18 28L28 4Z"
      fill={color}
      fillOpacity="0.2"
    />
    <path d="M15 17L28 4" />
  </svg>
);

export const DoodleCamera: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-6 h-6',
  color = '#8DA399',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Body */}
    <rect
      x="7"
      y="16"
      width="34"
      height="24"
      rx="6"
      fill={color}
      fillOpacity="0.12"
    />
    {/* Top hump */}
    <path d="M18 16L20 11H28L30 16" />
    {/* Lens */}
    <circle cx="24" cy="28" r="6.5" />
    <circle cx="24" cy="28" r="2.5" fill={color} fillOpacity="0.4" />
    {/* Flash dot */}
    <circle cx="34" cy="21" r="1.5" fill={color} />
  </svg>
);
