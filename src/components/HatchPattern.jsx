// src/components/HatchPattern.jsx
import React from 'react';

const HatchPattern = ({ className = "", opacity = 0.4, patternSize = 8 }) => {
  const hatchStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 1,
    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg width='${patternSize}' height='${patternSize}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,${patternSize} L${patternSize},0' stroke='%23999' stroke-width='0.5' opacity='${opacity}'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'repeat',
    backgroundSize: `${patternSize}px ${patternSize}px`
  };

  return <div className={className} style={hatchStyle} />;
};

export default HatchPattern;