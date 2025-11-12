from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# Initialize FastAPI app
app = FastAPI(title="Todo API")

# Configure CORS to allow requests from your React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class TodoCreate(BaseModel):
    title: str

class Todo(BaseModel):
    id: int
    title: str
    completed: bool = False

# In-memory database (for development)
todos_db: List[Todo] = []
next_id = 1

# Routes

@app.get("/")
def root():
    """Health check endpoint"""
    return {"message": "Todo API is running"}

@app.get("/todos", response_model=List[Todo])
def get_todos():
    """Get all todos"""
    return todos_db

@app.post("/todos", response_model=Todo)
def create_todo(todo: TodoCreate):
    """Create a new todo"""
    global next_id
    new_todo = Todo(id=next_id, title=todo.title, completed=False)
    todos_db.append(new_todo)
    next_id += 1
    return new_todo

@app.put("/todos/{todo_id}", response_model=Todo)
def toggle_todo(todo_id: int):
    """Toggle todo completion status"""
    for todo in todos_db:
        if todo.id == todo_id:
            todo.completed = not todo.completed
            return todo
    raise HTTPException(status_code=404, detail="Todo not found")

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    """Delete a todo"""
    global todos_db
    for i, todo in enumerate(todos_db):
        if todo.id == todo_id:
            todos_db.pop(i)
            return {"message": "Todo deleted successfully"}
    raise HTTPException(status_code=404, detail="Todo not found")

# Run the server
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)