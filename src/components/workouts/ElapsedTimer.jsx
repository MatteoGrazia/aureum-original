// Isolated elapsed timer — memoized so parent re-renders don't affect it
// and timer ticks don't re-render parent components (Change 11 perf fix)
import React, { useState, useEffect } from 'react';

const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const ElapsedTimer = React.memo(function ElapsedTimer({ workoutStartTime, style }) {
  const [elapsed, setElapsed] = useState(() => {
    if (workoutStartTime) return Math.floor((Date.now() - new Date(workoutStartTime).getTime()) / 1000);
    return 0;
  });

  useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="tabular-nums" style={style}>
      {formatTime(elapsed)}
    </span>
  );
});

export default ElapsedTimer;