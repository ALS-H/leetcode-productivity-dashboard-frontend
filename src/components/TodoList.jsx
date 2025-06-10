import React, { useEffect, useState } from 'react';
import '../styles/Todo.css';

const API = import.meta.env.VITE_API_BASE_URL;


export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await fetch(`${API}/api/todos`);
    const data = await res.json();
    setTodos(data);
  };

  const addTodo = async () => {
    if (!task.trim()) return;
    const res = await fetch(`${API}/api/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }),
    });
    const data = await res.json();
    setTodos([data, ...todos]);
    setTask('');
  };

  const toggleComplete = async (id, completed) => {
    const res = await fetch(`${API}/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed }),
    });
    const data = await res.json();
    setTodos(todos.map(t => (t._id === id ? data : t)));
  };

  const deleteTodo = async id => {
    await fetch(`${API}/api/todos/${id}`, { method: 'DELETE' });
    setTodos(todos.filter(t => t._id !== id));
  };

  return (
    <div className="todo-section">
      <h2>Todo List</h2>
      <div className="todo-input">
        <input
          type="text"
          value={task}
          onChange={e => setTask(e.target.value)}
          placeholder="New task..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo._id} className="todo-item">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleComplete(todo._id, todo.completed)}
            />
            <span className={todo.completed ? 'completed' : ''}>{todo.task}</span>
            <button className="delete-btn" onClick={() => deleteTodo(todo._id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
