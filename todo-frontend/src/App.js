import React, { useEffect, useState } from "react";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDropping, setIsDropping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = "http://127.0.0.1:8000/todos";

  // Fetch todos
  const fetchTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, { mode: "cors" });
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      setError(err.message || "Failed to connect to backend");
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Add todo
  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTodo }),
    });
    setNewTodo("");
    fetchTodos();
  };

  // Toggle complete
  const toggleComplete = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "PUT" });
    fetchTodos();
  };

  // Delete todo
  const deleteTodo = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchTodos();
  };

  // Select/deselect individual todo
  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  // Select all todos
  const selectAll = () => {
    if (selectedIds.size === todos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(todos.map((t) => t.id)));
    }
  };

  // Drop (delete) all selected todos with animation
  const dropSelected = async () => {
    if (selectedIds.size === 0) return;
    setIsDropping(true);
    await new Promise((resolve) => setTimeout(resolve, 600)); // wait for animation
    await Promise.all(
      Array.from(selectedIds).map((id) =>
        fetch(`${API_URL}/${id}`, { method: "DELETE" })
      )
    );
    setSelectedIds(new Set());
    setIsDropping(false);
    fetchTodos();
  };

  // Animated particles background
  const particles = Array.from({ length: 12 }).map((_, i) => {
    const size = 30 + Math.round(Math.random() * 140);
    const left = Math.round(Math.random() * 100);
    const duration = 8 + Math.random() * 18;
    const delay = -Math.random() * 14;
    const colors = [
      "rgba(244,63,94,0.22)",   // pink-red
      "rgba(220,38,38,0.18)",   // red
      "rgba(239,68,68,0.16)",   // lighter red
      "rgba(255,99,132,0.14)"   // soft rose
    ];
    const bg = colors[i % colors.length];
    return (
      <span
        key={i}
        className="particle"
        style={{
          left: `${left}%`,
          width: `${size}px`,
          height: `${size}px`,
          background: bg,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        }}
      />
    );
  });

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* moving particles background */}
      <div className="moving-bg" aria-hidden="true">
        {particles}
      </div>

      {/* main content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 600,
          margin: "50px auto",
          textAlign: "center",
          padding: 20,
          /* make slightly translucent so background shows through */
          background: "rgba(220,38,38,0.94)", // changed to red
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <h1 style={{ color: "#fff", marginBottom: 20 }}>🌟 My To-Do App 🌟</h1>

        {/* error & loading states */}
        {loading && <p style={{ color: "#fff" }}>Loading...</p>}
        {error && (
          <p style={{ color: "yellow", fontWeight: "bold" }}>
            ⚠️ {error}
          </p>
        )}

        {/* Selection controls */}
        {todos.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              marginBottom: 15,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={selectAll}
              style={{
                padding: "8px 16px",
                background:
                  selectedIds.size === todos.length ? "#8b5cf6" : "#6366f1",
                color: "white",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 14,
                transition: "all 0.3s",
              }}
            >
              {selectedIds.size === todos.length ? "✓ Deselect All" : "Select All"}
            </button>

            {selectedIds.size > 0 && (
              <button
                onClick={dropSelected}
                disabled={isDropping}
                style={{
                  padding: "8px 16px",
                  background: isDropping ? "#9ca3af" : "#f97316",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  cursor: isDropping ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  fontSize: 14,
                  transition: "all 0.3s",
                  animation: isDropping ? "pulse 0.6s ease-in-out" : "none",
                }}
              >
                {isDropping ? "Dropping..." : `🗑️ Drop (${selectedIds.size})`}
              </button>
            )}
          </div>
        )}

        {/* Add Todo Form */}
        <form
          onSubmit={addTodo}
          style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}
        >
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Enter a new task..."
            style={{
              padding: 10,
              width: 300,
              borderRadius: 12,
              border: "2px solid #2563eb",
              outline: "none",
              fontSize: 16,
              transition: "0.3s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#10b981")}
            onBlur={(e) => (e.target.style.borderColor = "#2563eb")}
          />
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              marginLeft: 10,
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              fontWeight: "bold",
              transition: "0.3s",
            }}
          >
            Add
          </button>
        </form>

        {/* Todo List */}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {todos.map((todo) => {
            const isSelected = selectedIds.has(todo.id);
            const shouldDrop = isDropping && isSelected;

            return (
              <li
                key={todo.id}
                className={shouldDrop ? "dropping" : ""}
                style={{
                  margin: "10px 0",
                  padding: 12,
                  background: isSelected
                    ? "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)"
                    : todo.completed
                    ? "#d1fae5"
                    : "#f0f9ff",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: isSelected
                    ? "0 6px 20px rgba(245, 158, 11, 0.4)"
                    : "0 4px 10px rgba(0,0,0,0.05)",
                  transition: "all 0.3s",
                  border: isSelected ? "2px solid #f59e0b" : "2px solid transparent",
                  transform: isSelected ? "scale(1.02)" : "scale(1)",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flex: 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(todo.id)}
                    style={{
                      width: 20,
                      height: 20,
                      cursor: "pointer",
                      accentColor: "#f59e0b",
                    }}
                  />
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo.id)}
                    style={{ width: 18, height: 18, cursor: "pointer" }}
                  />
                  <span
                    style={{
                      textDecoration: todo.completed ? "line-through" : "none",
                      color: isSelected
                        ? "#ffffff"
                        : todo.completed
                        ? "#6b7280"
                        : "#111827",
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: 16,
                    }}
                  >
                    {todo.title}
                  </span>
                </label>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    transition: "0.3s",
                  }}
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Background animations */}
      <style>{`
        .moving-bg { position: absolute; inset: 0; z-index: 1; overflow: hidden; pointer-events: none; }
        .particle {
          position: absolute;
          bottom: -20vh;
          border-radius: 50%;
          filter: blur(12px);
          opacity: 0.9;
          transform: translate3d(0,0,0);
          will-change: transform;
          animation-name: rise;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes rise {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.9; }
          50% { transform: translate3d(6vw, -60vh, 0) rotate(30deg); }
          90% { opacity: 0.6; }
          100% { transform: translate3d(-6vw, -140vh, 0) rotate(-20deg); opacity: 0; }
        }
        @keyframes dropOut {
          0% { transform: scale(1) translateY(0) rotateZ(0deg); opacity: 1; }
          50% { transform: scale(0.8) translateY(20px) rotateZ(5deg); opacity: 0.6; }
          100% { transform: scale(0.3) translateY(60px) rotateZ(15deg); opacity: 0; }
        }
        .dropping { animation: dropOut 0.6s ease-in-out forwards !important; pointer-events: none; }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
      `}</style>
    </div>
  );
}

export default App;
