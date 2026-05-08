// Isolated elapsed timer — memoized so parent re-renders don't affect it
// and timer ticks don't re-render parent components (Change 11 perf fix)
import React, { useState, useEffect } from 'react';

const formatTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const ElapsedTimer = React.memo(function ElapsedTimer({ workoutStartTime, style }) {
  // Always derive elapsed from the real start time so restoring after minimize shows correct value
  const getElapsed = () => {
    if (workoutStartTime) return Math.floor((Date.now() - new Date(workoutStartTime).getTime()) / 1000);
    return 0;
  };
  const [elapsed, setElapsed] = useState(getElapsed);

  useEffect(() => {
    // Re-sync on mount in case component remounted after minimize/restore
    setElapsed(getElapsed());
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(workoutStartTime).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutStartTime]);

  return (
    <span className="tabular-nums" style={style}>
      {formatTime(elapsed)}
    </span>
  );
});

export default ElapsedTimer;