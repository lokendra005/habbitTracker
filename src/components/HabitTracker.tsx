import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, ReferenceLine
} from 'recharts';
import { format, subDays } from 'date-fns';

const HabitTracker = () => {
  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState(null);
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  
  // Initialize darkMode with user preference or system preference
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
         (!('darkMode' in localStorage) && 
         window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  // Habits data
  const [habits, setHabits] = useState([
    {
      id: '1',
      name: 'Water intake',
      icon: '💧',
      streak: 7,
      goal: 8,
      unit: 'glasses',
      progress: 6,
      history: Array.from({ length: 7 }).map((_, i) => ({
        date: format(subDays(new Date(), 6 - i), 'MMM dd'),
        value: 4 + Math.floor(Math.random() * 5)
      })),
      color: '#3b82f6'
    },
    {
      id: '2',
      name: 'Sleep',
      icon: '😴',
      streak: 4,
      goal: 8,
      unit: 'hours',
      progress: 7.5,
      history: Array.from({ length: 7 }).map((_, i) => ({
        date: format(subDays(new Date(), 6 - i), 'MMM dd'),
        value: 5 + Math.random() * 4
      })),
      color: '#8b5cf6'
    },
    {
      id: '3',
      name: 'Exercise',
      icon: '🏃',
      streak: 2,
      goal: 30,
      unit: 'minutes',
      progress: 15,
      history: Array.from({ length: 7 }).map((_, i) => ({
        date: format(subDays(new Date(), 6 - i), 'MMM dd'),
        value: Math.random() > 0.2 ? 10 + Math.floor(Math.random() * 40) : 0
      })),
      color: '#ef4444'
    },
    {
      id: '4',
      name: 'Screen time',
      icon: '📱',
      streak: 0,
      goal: 120,
      unit: 'minutes',
      progress: 185,
      history: Array.from({ length: 7 }).map((_, i) => ({
        date: format(subDays(new Date(), 6 - i), 'MMM dd'),
        value: 100 + Math.floor(Math.random() * 180)
      })),
      color: '#f59e0b'
    }
  ]);

  // Notification timeout ref
  const notificationTimeoutRef = useRef(null);

  // Effects
  // Handle notifications
  useEffect(() => {
    if (notification) {
      notificationTimeoutRef.current = setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [notification]);

  // Handle dark mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', darkMode.toString());
      console.log("Dark mode set to:", darkMode);
      
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode]);

  // Handlers
  const handleUpdateHabitProgress = (habit, newValue) => {
    setHabits(habits.map(h => {
      if (h.id === habit.id) {
        return {
          ...h,
          progress: newValue,
          streak: newValue >= h.goal ? h.streak + 1 : 0
        };
      }
      return h;
    }));
    
    showNotify(`Updated ${habit.name} progress to ${newValue} ${habit.unit}`);
  };

  const handleAddHabit = () => {
    if (!newHabitName.trim()) {
      showNotify('Please enter a habit name');
      return;
    }
    const newHabit = {
      id: Date.now().toString(),
      name: newHabitName,
      icon: '✨',
      streak: 0,
      goal: 1,
      unit: 'times',
      progress: 0,
      history: Array.from({ length: 7 }).map((_, i) => ({
        date: format(subDays(new Date(), 6 - i), 'MMM dd'),
        value: 0
      })),
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    };
    
    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setShowAddHabitModal(false);
    showNotify(`Added new habit: ${newHabitName}`);
  };

  const handleDeleteHabit = (habitId) => {
    const habitToDelete = habits.find(h => h.id === habitId);
    if (habitToDelete) {
      setHabits(habits.filter(h => h.id !== habitId));
      showNotify(`Deleted habit: ${habitToDelete.name}`);
    }
  };

  const showNotify = (message) => {
    setNotification(message);
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">✨ HabitTracker</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </nav>
      {/* Main content */}
      <main className="max-w-5xl mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{format(new Date(), 'EEEE, MMMM d')}</h1>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-1"
            onClick={() => setShowAddHabitModal(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Habit</span>
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-1 flex space-x-1">
          <button 
            className={`flex-1 py-2 px-4 rounded ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`flex-1 py-2 px-4 rounded ${activeTab === 'habits' ? 'bg-indigo-600 text-white' : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => setActiveTab('habits')}
          >
            My Habits
          </button>
          <button 
            className={`flex-1 py-2 px-4 rounded ${activeTab === 'stats' ? 'bg-indigo-600 text-white' : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
        </div>
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Today's Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Today&apos;s Progress</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {habits.map(habit => (
                  <div key={habit.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center">
                    <div className="text-2xl mr-4">{habit.icon}</div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{habit.name}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {habit.progress}/{habit.goal} {habit.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${Math.min(100, (habit.progress / habit.goal) * 100)}%`,
                            backgroundColor: habit.color
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Weekly Overview</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" allowDuplicatedCategory={false} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {habits.map(habit => (
                      <Line 
                        key={habit.id}
                        type="monotone" 
                        dataKey="value" 
                        name={habit.name}
                        stroke={habit.color} 
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                        data={habit.history}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Streaks */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Current Streaks</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {habits.map(habit => (
                  <div key={habit.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">{habit.icon}</div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{habit.name}</div>
                    <div className="text-2xl font-bold" style={{ color: habit.color }}>{habit.streak}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">days</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Habits */}
        {activeTab === 'habits' && (
          <div className="space-y-4">
            {habits.map(habit => (
              <motion.div 
                key={habit.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">{habit.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white">{habit.name}</h3>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Goal: {habit.goal} {habit.unit} per day
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-indigo-100 dark:bg-indigo-900 px-3 py-1 rounded-full">
                      <span className="text-indigo-600 dark:text-indigo-300 font-medium">🔥 {habit.streak}</span>
                    </div>
                    <button 
                      className="text-red-500 hover:text-red-700 p-1"
                      onClick={() => handleDeleteHabit(habit.id)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mb-4 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={habit.history}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill={habit.color} />
                      <ReferenceLine y={habit.goal} stroke="red" strokeDasharray="3 3" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                    Today&apos;s progress: {habit.progress} / {habit.goal} {habit.unit}
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max={habit.goal * 2} 
                    value={habit.progress} 
                    step="0.5"
                    onChange={(e) => handleUpdateHabitProgress(habit, parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Overall Completion Rate</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={habits.map(habit => ({
                        name: habit.name,
                        value: (habit.progress / habit.goal) * 100
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {habits.map((habit, index) => (
                        <Cell key={`cell-${index}`} fill={habit.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAddHabitModal && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddHabitModal(false)}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Add New Habit</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Meditation"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2 pt-4">
                  <button
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors"
                    onClick={handleAddHabit}
                  >
                    Add Habit
                  </button>
                  <button
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowAddHabitModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                  <button 
                    onClick={toggleDarkMode}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                      darkMode ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className="sr-only">Toggle dark mode</span>
                    <motion.span 
                      className="inline-block w-4 h-4 bg-white rounded-full"
                      animate={{ x: darkMode ? 20 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <button
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors"
                    onClick={() => {
                      setShowSettings(false);
                      showNotify('Settings saved successfully!');
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowSettings(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner py-6 mt-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">✨ HabitTracker</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track your habits, improve your life</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                Help
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                Privacy
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HabitTracker;
