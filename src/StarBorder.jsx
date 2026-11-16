import React from 'react';
import './StarBorder.css';

const trail = [
  { length: 11, offset: 19, opacity: 0.15 },
  { length: 9, offset: 10, opacity: 0.36 },
  { length: 7, offset: 3, opacity: 0.68 },
  { length: 3, offset: 0, opacity: 1 },
];

export default function StarBorder({ children, className }) {
  return (
    <figure className={`star-border ${className}`}>
      {children}
      <svg className="star-border__outline" aria-hidden="true">
        <rect className="star-border__track" />
        <g className="star-border__trail">
          {trail.map(({ length, offset, opacity }) => (
            <rect
              key={offset}
              pathLength="100"
              strokeOpacity={opacity}
              strokeDasharray={`${length} ${100 - length}`}
              style={{ '--trail-offset': offset }}
            />
          ))}
        </g>
      </svg>
    </figure>
  );
}
