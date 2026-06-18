import React, { useState, useEffect } from 'react';
import './App.css';

// Initial default tasks for first-time load
const DEFAULT_TODOS = [
  {
    id: 'demo-1',
    title: 'Welcome to Aura Tasks! 🚀',
    priority: 'high',
    category: 'work',
    dueDate: new Date().toISOString().split('T')[0],
    completed: false,
    createdAt: Date.now() - 3600000 * 2
  },
  {
    id: 'demo-2',
    title: 'Plan weekly meals & prep veggies',
    priority: 'medium',
    category: 'wellness',
    dueDate: '',
    completed: false,
    createdAt: Date.now() - 3600000
  },
  {
    id: 'demo-3',
    title: 'Completed test task',
    priority: 'low',
    category: 'personal',
    dueDate: '',
    completed: true,
    createdAt: Date.now() - 3600000 * 5
  }
];

export default function App() {
  // --- State Hooks ---
  const [todos, setTodos] = useState(() => {
    const stored = localStorage.getItem('aura-todos');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored todos', e);
      }
    }
    return DEFAULT_TODOS;
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('aura-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Task Creation Form States
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskCategory, setTaskCategory] = useState('personal');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Filters & Search States
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created-desc');

  // Deleting item states (to trigger CSS transition)
  const [deletingIds, setDeletingIds] = useState([]);

  // --- Effects ---
  // Sync todos to localStorage
  useEffect(() => {
    localStorage.setItem('aura-todos', JSON.stringify(todos));
  }, [todos]);

  // Sync theme attribute to HTML tag and localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aura-theme', theme);
  }, [theme]);

  // --- Handlers ---
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTodo = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: taskTitle.trim(),
      priority: taskPriority,
      category: taskCategory,
      dueDate: taskDueDate,
      completed: false,
      createdAt: Date.now()
    };

    setTodos(prev => [newTodo, ...prev]);
    
    // Reset form fields
    setTaskTitle('');
    setTaskDueDate('');
    setTaskPriority('medium');
    setTaskCategory('personal');
  };

  const handleToggleComplete = (id) => {
    setTodos(prev =>
      prev.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    );
  };

  const handleDeleteTask = (id) => {
    setDeletingIds(prev => [...prev, id]);
    // Match the 350ms deletion animation transition duration
    setTimeout(() => {
      setTodos(prev => prev.filter(todo => todo.id !== id));
      setDeletingIds(prev => prev.filter(item => item !== id));
    }, 350);
  };

  // --- Stats Computations ---
  const totalCount = todos.length;
  const completedCount = todos.filter(t => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const efficiency = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // --- Filter & Sort Logic ---
  const filteredTodos = todos
    .filter(todo => {
      // Status filter
      if (statusFilter === 'pending' && todo.completed) return false;
      if (statusFilter === 'completed' && !todo.completed) return false;

      // Category filter
      if (categoryFilter !== 'all' && todo.category !== categoryFilter) return false;

      // Priority filter
      if (priorityFilter !== 'all' && todo.priority !== priorityFilter) return false;

      // Search query filter
      if (searchQuery.trim() && !todo.title.toLowerCase().includes(searchQuery.toLowerCase().trim())) return false;

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created-asc':
          return a.createdAt - b.createdAt;
        
        case 'created-desc':
          return b.createdAt - a.createdAt;

        case 'due-date':
          if (!a.dueDate && !b.dueDate) return b.createdAt - a.createdAt;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);

        case 'priority-desc': {
          const weights = { high: 3, medium: 2, low: 1 };
          const diff = weights[b.priority] - weights[a.priority];
          if (diff !== 0) return diff;
          return b.createdAt - a.createdAt;
        }

        default:
          return b.createdAt - a.createdAt;
      }
    });

  // Helper date formatter
  const formatDueDate = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Background blobs */}
      <div className="background-decorations">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>

      <div className="app-container">
        {/* App Header */}
        <header className="app-header">
          <div className="brand">
            <div className="brand-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2.5"/>
                <path d="M9 12L11 14L15 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="brand-text">
              <h1>Aura Tasks</h1>
              <p>Optimize your daily flow</p>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              id="theme-toggle" 
              className="icon-button" 
              onClick={toggleTheme}
              aria-label="Toggle light/dark theme"
            >
              {/* Sun icon for Dark theme */}
              <svg className="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              {/* Moon icon for Light theme */}
              <svg className="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </button>
          </div>
        </header>

        <main className="main-content">
          {/* Dashboard Stats */}
          <section className="stats-panel glass-panel">
            <div className="stat-card">
              <div className="stat-info">
                <span className="stat-label">Total Tasks</span>
                <span className="stat-value">{totalCount}</span>
              </div>
              <div className="stat-icon total-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <span className="stat-label">Pending</span>
                <span className="stat-value">{pendingCount}</span>
              </div>
              <div class="stat-icon pending-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <span className="stat-label">Completed</span>
                <span className="stat-value">{completedCount}</span>
              </div>
              <div className="stat-icon completed-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>

            <div className="stat-card progress-card">
              <div className="stat-info">
                <span className="stat-label">Efficiency</span>
                <span className="stat-value">{efficiency}%</span>
              </div>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${efficiency}%` }}></div>
              </div>
            </div>
          </section>

          {/* Task Creator Form */}
          <section className="creator-panel glass-panel">
            <form id="todo-form" onSubmit={handleCreateTask}>
              <div className="form-row-main">
                <input 
                  type="text" 
                  id="todo-input" 
                  placeholder="Add a new task..." 
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required 
                  autoComplete="off"
                />
                <button type="submit" className="primary-button" id="add-task-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>Add Task</span>
                </button>
              </div>

              <div className="form-row-details">
                <div className="input-group">
                  <label htmlFor="todo-priority">Priority</label>
                  <div className="select-wrapper">
                    <select 
                      id="todo-priority"
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="todo-category">Category</label>
                  <div className="select-wrapper">
                    <select 
                      id="todo-category"
                      value={taskCategory}
                      onChange={(e) => setTaskCategory(e.target.value)}
                    >
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                      <option value="shopping">Shopping</option>
                      <option value="wellness">Wellness</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="todo-due-date">Due Date (Optional)</label>
                  <input 
                    type="date" 
                    id="todo-due-date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                  />
                </div>
              </div>
            </form>
          </section>

          {/* Filters & Actions Panel */}
          <section className="filters-panel glass-panel">
            <div className="search-bar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                id="search-input" 
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filters-actions">
              <div className="filter-tabs">
                <button 
                  className={`tab-button ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >All</button>
                <button 
                  className={`tab-button ${statusFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('pending')}
                >Pending</button>
                <button 
                  className={`tab-button ${statusFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('completed')}
                >Completed</button>
              </div>

              <div className="filter-dropdowns">
                <select 
                  id="filter-category" 
                  className="filter-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="shopping">Shopping</option>
                  <option value="wellness">Wellness</option>
                  <option value="other">Other</option>
                </select>

                <select 
                  id="filter-priority" 
                  className="filter-select"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                
                <select 
                  id="sort-by" 
                  className="filter-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="created-desc">Newest First</option>
                  <option value="created-asc">Oldest First</option>
                  <option value="due-date">Due Date</option>
                  <option value="priority-desc">Highest Priority First</option>
                </select>
              </div>
            </div>
          </section>

          {/* Task List */}
          <section className="todo-list-container">
            {filteredTodos.length === 0 ? (
              <div id="empty-state" className="empty-state" style={{ display: 'flex' }}>
                <div className="empty-illustration">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 12h8"></path>
                    <path d="M12 8v8"></path>
                  </svg>
                </div>
                <h3>All caught up!</h3>
                <p>No tasks match your current filters. Add a task to get started.</p>
              </div>
            ) : (
              <ul id="todo-list" className="todo-list">
                {filteredTodos.map(todo => {
                  const isDeleting = deletingIds.includes(todo.id);
                  return (
                    <li 
                      key={todo.id} 
                      className={`todo-item ${todo.completed ? 'completed' : ''} ${isDeleting ? 'slide-out' : ''}`}
                    >
                      <button 
                        className="todo-checkbox" 
                        onClick={() => handleToggleComplete(todo.id)}
                        aria-label={todo.completed ? 'Mark task incomplete' : 'Mark task complete'}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </button>
                      
                      <div className="todo-content">
                        <span className="todo-title">{todo.title}</span>
                        <div className="todo-meta">
                          <span className={`badge badge-category ${todo.category}`}>{todo.category}</span>
                          <span className={`badge badge-priority-${todo.priority}`}>{todo.priority}</span>
                          {todo.dueDate && (
                            <div className="todo-due" title="Due Date">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                              </svg>
                              <span>{formatDueDate(todo.dueDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button 
                        className="delete-button" 
                        onClick={() => handleDeleteTask(todo.id)}
                        aria-label="Delete task"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
