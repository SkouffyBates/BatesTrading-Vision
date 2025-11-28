import React from 'react';

const Skeleton = ({ width = '100%', height = '1rem', className = '' }) => {
  return (
    <div className={`skeleton bg-slate-800 animate-pulse rounded ${className}`} style={{ width, height }} />
  );
};

export default Skeleton;
