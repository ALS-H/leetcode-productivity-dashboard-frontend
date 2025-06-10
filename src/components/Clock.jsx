import React, { useState, useEffect, useRef } from "react";
import "../styles/Clock.css";
const API = import.meta.env.VITE_API_BASE_URL;

function Clock() {
  const [isPomodoro, setIsPomodoro] = useState(false);
  const [time, setTime] = useState(new Date());

  const FOCUS_MINUTES = 25;
  const BREAK_MINUTES = 5;

  const [isFocusPhase, setIsFocusPhase] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [totalTime, setTotalTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const timerInterval = useRef(null);
  const focusStartTime = useRef(null);

  // Fetch total study time (no userId now)
  const fetchTotalStudyTime = async () => {
    try {
      const res = await fetch(`${API}/api/sessions/total/demo-user`);
      const data = await res.json();
      setTotalTime(data);
    } catch (err) {
      console.error("Failed to fetch total study time", err);
    }
  };

  // Live clock
  useEffect(() => {
    const clockInterval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (isRunning) {
      timerInterval.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval.current);
            setIsRunning(false);

            if (isFocusPhase) {
              // Calculate actual duration
              const durationInSeconds = Math.floor((Date.now() - focusStartTime.current) / 1000);

              fetch(`${API}/api/sessions/complete/${sessionId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ duration: durationInSeconds }),
              })
                .then(() => fetchTotalStudyTime())
                .catch((err) => console.error("Failed to complete session", err));

              // Start break
              setTimeout(() => {
                setIsFocusPhase(false);
                setSecondsLeft(BREAK_MINUTES * 60);
                setIsRunning(true);
              }, 1000);
            } else {
              // Start new Pomodoro
              setTimeout(() => {
                setSessionId(null);
                startPomodoro();
              }, 1000);
            }

            return 0;
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerInterval.current);
    }

    return () => clearInterval(timerInterval.current);
  }, [isRunning, sessionId, isFocusPhase]);

  useEffect(() => {
    fetchTotalStudyTime();
  }, []);

  const formatTime = (secs) => {
    const minutes = String(Math.floor(secs / 60)).padStart(2, "0");
    const seconds = String(secs % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const toggleMode = () => {
    setIsPomodoro((prev) => !prev);
  };

  const startPomodoro = () => {
  if (!sessionId) {
    setIsFocusPhase(true);
    setSecondsLeft(FOCUS_MINUTES * 60); // Always reset to full session on new start

    fetch(`${API}/api/sessions/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}), // No userId
    })
      .then((res) => res.json())
      .then((data) => {
        setSessionId(data._id);
        focusStartTime.current = Date.now();
        setIsRunning(true);
      })
      .catch((err) => console.error("Failed to start session", err));
  } else {
    // Resume running if already in a session
    if (secondsLeft <= 0 || secondsLeft === null) {
      setSecondsLeft(FOCUS_MINUTES * 60); // Set to full time if it somehow hit 0
    }
    focusStartTime.current = Date.now();
    setIsRunning(true);
  }
};


  const handleStartPause = (e) => {
    e.stopPropagation();

    if (!isRunning) {
      if (isFocusPhase && !sessionId) {
        startPomodoro();
      } else {
        setIsRunning(true);
      }
    } else {
      setIsRunning(false);
    }
  };

  const handleReset = (e) => {
    e.stopPropagation();
    setIsRunning(false);
    setIsFocusPhase(true);
    setSessionId(null);
    setSecondsLeft(FOCUS_MINUTES * 60);
  };

  return (
    <div className="clock-card" onClick={toggleMode}>
      {isPomodoro ? (
        <>
          <h2 className="clock-title">{isFocusPhase ? "Focus Session" : "Break Time"}</h2>
          <p className="clock-time">{formatTime(secondsLeft)}</p>

          <div className="timer-controls">
            <button onClick={handleStartPause}>
              {isRunning ? "Pause" : "Start"}
            </button>
            <button onClick={handleReset}>Reset</button>
          </div>

          <p className="tip">(Click anywhere to switch to Clock)</p>
        </>
      ) : (
        <>
          <h2 className="clock-title">Clock</h2>
          <p className="clock-time">{time.toLocaleTimeString()}</p>
          <p style={{ fontWeight: "600", marginTop: "1rem" }}>
            Pomodoro Timer: {formatTime(secondsLeft)} {isRunning ? "(Running)" : "(Paused)"} [{isFocusPhase ? "Focus" : "Break"}]
          </p>
          <p style={{ fontWeight: "600", marginTop: "1rem" }}>
            Total Study Time: {totalTime.hours}h {totalTime.minutes}m {totalTime.seconds}s
          </p>
          <p className="tip">(Click anywhere to switch to Pomodoro)</p>
        </>
      )}
    </div>
  );
}

export default Clock;
