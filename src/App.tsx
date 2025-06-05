import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import EventForm from './components/events/EventForm';
import AssignmentForm from './components/assignments/AssignmentForm';
import { Plus, Calendar, BookOpen } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  
  const toggleAddMenu = () => {
    setShowAddMenu(!showAddMenu);
  };
  
  const handleAddEvent = () => {
    setShowAddMenu(false);
    setShowEventForm(true);
  };
  
  const handleAddAssignment = () => {
    setShowAddMenu(false);
    setShowAssignmentForm(true);
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <Dashboard />
        
        {/* Floating action button */}
        <div className="fixed right-8 bottom-8">
          <div className="relative">
            <AnimatePresence>
              {showAddMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg overflow-hidden w-52"
                >
                  <div className="p-2">
                    <button
                      onClick={handleAddEvent}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      <Calendar className="h-5 w-5 mr-3 text-indigo-600" />
                      <span>Ajouter un événement</span>
                    </button>
                    <button
                      onClick={handleAddAssignment}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      <BookOpen className="h-5 w-5 mr-3 text-pink-600" />
                      <span>Ajouter un devoir</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleAddMenu}
              className="bg-indigo-600 rounded-full p-4 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-6 w-6" />
            </motion.button>
          </div>
        </div>
        
        {/* Modal for event form */}
        <AnimatePresence>
          {showEventForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center"
            >
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowEventForm(false)} />
              <div className="relative z-10 w-full max-w-md p-4">
                <EventForm onClose={() => setShowEventForm(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Modal for assignment form */}
        <AnimatePresence>
          {showAssignmentForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center"
            >
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAssignmentForm(false)} />
              <div className="relative z-10 w-full max-w-md p-4">
                <AssignmentForm onClose={() => setShowAssignmentForm(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppProvider>
  );
}

export default App;