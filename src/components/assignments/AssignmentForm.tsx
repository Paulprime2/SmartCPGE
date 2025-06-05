import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { format, addDays } from 'date-fns';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface AssignmentFormProps {
  onClose: () => void;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ onClose }) => {
  const { subjects, addAssignment } = useAppContext();
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'dm' | 'other'>('dm');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [dueTime, setDueTime] = useState('12:00');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [description, setDescription] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dueDateTimeString = `${dueDate}T${dueTime}:00`;
    
    addAssignment({
      title,
      type,
      subjectId,
      dueDate: dueDateTimeString,
      priority,
      status: 'pending',
      estimatedHours,
      description
    });
    
    onClose();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-white rounded-lg shadow-xl overflow-hidden"
    >
      <div className="px-4 py-5 bg-pink-600 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-white">
            Ajouter un devoir
          </h3>
          <div className="h-10 w-10 bg-white bg-opacity-25 rounded-full flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Titre
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <div className="mt-1">
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as 'dm' | 'other')}
                className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="dm">DM</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Matière
            </label>
            <div className="mt-1">
              <select
                id="subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priorité
            </label>
            <div className="mt-1">
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
              Date d'échéance
            </label>
            <div className="mt-1">
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="dueTime" className="block text-sm font-medium text-gray-700">
              Heure
            </label>
            <div className="mt-1">
              <input
                type="time"
                id="dueTime"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                required
                className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="sm:col-span-6">
            <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700">
              Temps estimé (heures)
            </label>
            <div className="mt-1">
              <input
                type="number"
                id="estimatedHours"
                min="1"
                max="20"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                required
                className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Cela aidera à planifier efficacement les sessions de révision.
            </p>
          </div>
          
          <div className="sm:col-span-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (optionnel)
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="mr-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            Ajouter
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AssignmentForm;