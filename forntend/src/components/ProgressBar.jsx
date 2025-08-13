import React from 'react';

export default function ProgressBar({ current, total }) {
  const pct = Math.round((current / (total - 1)) * 100);
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>
        Step {current + 1} of {total}
      </div>
      <div className="progress">
        <div style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
