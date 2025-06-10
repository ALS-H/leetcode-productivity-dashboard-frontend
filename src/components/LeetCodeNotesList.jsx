import React, { useState, useEffect } from "react";
import axios from "axios";
import LeetCodeNoteCard from "./LeetCodeNoteCard";
import "../styles/LeetCodeNotesList.css";
const API = import.meta.env.VITE_API_BASE_URL;


export default function LeetCodeNotesList() {
  const [notes, setNotes] = useState([]);
  const [url, setUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tempTags, setTempTags] = useState([]);
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [expandedNoteId, setExpandedNoteId] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/notes`)
      .then((res) => setNotes(res.data))
      .catch((err) => console.error("Error fetching notes:", err));
  }, []);

  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags)));

  function addTempTag() {
    const cleanTag = tagInput.trim();
    if (cleanTag && !tempTags.includes(cleanTag)) {
      setTempTags([...tempTags, cleanTag]);
      setTagInput("");
    }
  }

  function removeTempTag(tag) {
    setTempTags(tempTags.filter((t) => t !== tag));
  }

  function addNote(e) {
    e.preventDefault();
    if (!url.trim() || !content.trim()) return;

    const newNote = {
      title: url.trim(),
      link: url.trim(),
      tags: [...tempTags],
      content: content.trim(),
    };

    axios.post(`${API}/api/notes`, newNote)
      .then((res) => {
        setNotes([res.data, ...notes]);
        setUrl("");
        setContent("");
        setTempTags([]);
      })
      .catch((err) => {
        console.error("Error adding note:", err);
        alert("Failed to add note. Check backend.");
      });
  }

  function toggleSelectedTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  const filteredNotes =
    selectedTags.length === 0
      ? notes
      : notes.filter((note) =>
          selectedTags.some((tag) => note.tags.includes(tag))
        );

  function toggleExpand(id) {
    setExpandedNoteId((prevId) => (prevId === id ? null : id));
  }

  function handleDelete(id) {
    axios
      .delete(`${API}/api/notes/${id}`)
      .then(() => {
        setNotes(notes.filter((note) => note._id !== id));
        if (expandedNoteId === id) setExpandedNoteId(null);
      })
      .catch((err) => console.error("Error deleting note:", err));
  }

  async function handleUpdateNote(updatedNote) {
    try {
      const response = await axios.put(
        `${API}/api/notes/${updatedNote._id}`,
        updatedNote
      );
      const savedNote = response.data;

      setNotes((prevNotes) =>
        prevNotes.map((note) => (note._id === savedNote._id ? savedNote : note))
      );
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Failed to update note");
    }
  }

  return (
    <div className="lc-notes-container">
        <h2>Leetcode Notes</h2>
      <form onSubmit={addNote} className="lc-notes-form">
        <input
          type="url"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="lc-input"
          required
        />

        <div className="lc-tag-input-row">
          <input
            type="text"
            placeholder="Enter tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="lc-input"
          />
          <button
            type="button"
            className="lc-button add-tag-btn"
            onClick={addTempTag}
          >
            Add Tag
          </button>
        </div>

        <div className="lc-temp-tags">
          {tempTags.map((tag) => (
            <span key={tag} className="lc-temp-tag">
              {tag}
              <button
                type="button"
                onClick={() => removeTempTag(tag)}
                className="remove-tag-btn"
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        <textarea
          placeholder="Enter note content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="lc-textarea"
          required
        />

        <button type="submit" className="lc-button">
          Add Note
        </button>
      </form>

      <div className="lc-tags-filter">
        <strong>Tags: </strong>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleSelectedTag(tag)}
            className={`lc-tag-btn ${
              selectedTags.includes(tag) ? "selected" : ""
            }`}
            type="button"
          >
            {tag}
          </button>
        ))}
      </div>

      {filteredNotes.length === 0 ? (
        <p className="lc-no-notes">
          {selectedTags.length > 0 ? "No matching notes." : "No notes available."}
        </p>
      ) : (
        filteredNotes.map((note) => (
          <LeetCodeNoteCard
            key={note._id}
            note={note}
            onDelete={handleDelete}
            expanded={expandedNoteId === note._id}
            onToggleExpand={() => toggleExpand(note._id)}
            onUpdate={handleUpdateNote}
          />
        ))
      )}
    </div>
  );
}
