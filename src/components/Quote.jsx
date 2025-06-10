import React, { useState } from "react";
import '../styles/Quote.css';

const quotes = [
  "The best way to get started is to quit talking and begin doing.",
  "Don’t let yesterday take up too much of today.",
  "It’s not whether you get knocked down; it’s whether you get up.",
  "Dream bigger. Do bigger.",
  "Focus on being productive instead of busy.",
];

export default function Quote() {
  const [quote, setQuote] = useState(quotes[0]);

  const nextQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  };

  return (
    <div className="quote-card">
      <header className="quote-header">Motivation</header>
      <div className="quote-content">
        <p className="quote-text">“{quote}”</p>
        <button className="quote-button" onClick={nextQuote}>
          New Quote
        </button>
      </div>
    </div>
  );
}
