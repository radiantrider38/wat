
import React from 'react';

interface OLQBadgeProps {
  label: string;
}

const OLQBadge: React.FC<OLQBadgeProps> = ({ label }) => {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 group relative cursor-help">
      {label}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-slate-200 text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
        Officer Like Quality: This trait is critical for command and leadership in high-pressure environments.
      </div>
    </span>
  );
};

export default OLQBadge;
