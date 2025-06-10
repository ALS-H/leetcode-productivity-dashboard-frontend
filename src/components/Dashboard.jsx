import React from 'react';
import TodoList from './TodoList';
import LeetCodeNotesList from './LeetCodeNotesList';
import Clock from './Clock';
import Quote from './Quote';
import '../styles/Dashboard.css';

function Dashboard() {
  return (
    <>
      <h1 className="dashboard-title">Productivity Dashboard</h1>
      <div className="dashboard-container">
        <div className="left-column">
          <LeetCodeNotesList />
        </div>

        <div className="middle-column">
          <div className="card">
            <Clock />
          </div>
          <div className="card">
            <Quote />
          </div>
        </div>

        <div className="right-column">
          <TodoList />
        </div>
      </div>
    </>
  );
}

export default Dashboard;
