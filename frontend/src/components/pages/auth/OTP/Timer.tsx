import  { useEffect, useState } from 'react';

interface TimerProps {
  start: number; // Time in seconds
  onTimerEnd: () => void;
}

const Timer = ({ start, onTimerEnd }:TimerProps) => {
  const [time, setTime] = useState<number>(start);

  useEffect(() => {
    // Reset timer when start changes
    setTime(start);
  }, [start]);

  useEffect(() => {
    if (time <= 0) {
      onTimerEnd();
      return;
    }

    const interval = setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 1) {
          clearInterval(interval);
          onTimerEnd();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [time, onTimerEnd]);

  return (
    <div className="text-center mt-2 text-gray-600">
      {Math.floor(time / 60).toString().padStart(2, '0')}:{(time % 60).toString().padStart(2, '0')}
    </div>
  );
};

export default Timer;
