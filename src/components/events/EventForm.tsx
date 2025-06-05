import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface EventFormProps {
  onClose: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ onClose }) => {
  const { subjects, addEvent } = useAppContext();
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'course' | 'kholle' | 'ds' | 'dm' | 'other'>('course');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [recurrence, setRecurrence] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly'>('weekly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(
    format(new Date(new Date().setMonth(new Date().getMonth() + 3)), 'yyyy-MM-dd')
  );
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = `${date}T${endTime}:00`;
    
    addEvent({
      title,
      type,
      subjectId,
      startTime: startDateTime,
      endTime: endDateTime,
      location,
      description,
      ...(recurrence ? {
        recurrence: {
          frequency: recurrenceType,
          ...(recurrenceType === 'weekly' ? { daysOfWeek } : {}),
          endDate: recurrenceEndDate,
        }
      } : {})
    });
    
    onClose();
  };
  
  const toggleDayOfWeek = (day: number) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter(d => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day]);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-white rounded-lg shadow-xl overflow-hidden"
    >
      <div className="px-4 py-5 bg-indigo-600 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-white">
            Ajouter un événement
          </h3>
          <div className="h-10 w-10 bg-white bg-opacity-25 rounded-full flex items-center justify-center">
            <Calendar className="h-6 w-6 text-white" />
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
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                onChange={(e) => setType(e.target.value as any)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="course">Cours</option>
                <option value="kholle">Kholle</option>
                <option value="ds">DS</option>
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
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <div className="mt-1">
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
              Heure de début
            </label>
            <div className="mt-1">
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
              Heure de fin
            </label>
            <div className="mt-1">
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="sm:col-span-6">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Lieu (optionnel)
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
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
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="sm:col-span-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="recurrence"
                  type="checkbox"
                  checked={recurrence}
                  onChange={(e) => setRecurrence(e.target.checked)}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="recurrence" className="font-medium text-gray-700">
                  Récurrence
                </label>
                <p className="text-gray-500">Cet événement se répète régulièrement</p>
              </div>
            </div>
          </div>
          
          {recurrence && (
            <>
              <div className="sm:col-span-3">
                <label htmlFor="recurrenceType" className="block text-sm font-medium text-gray-700">
                  Type de récurrence
                </label>
                <div className="mt-1">
                  <select
                    id="recurrenceType"
                    value={recurrenceType}
                    onChange={(e) => setRecurrenceType(e.target.value as 'daily' | 'weekly')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="daily">Quotidien</option>
                    <option value="weekly">Hebdomadaire</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="recurrenceEndDate" className="block text-sm font-medium text-gray-700">
                  Date de fin
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    id="recurrenceEndDate"
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    required={recurrence}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {recurrenceType === 'weekly' && (
                <div className="sm:col-span-6">
                  <fieldset>
                    <legend className="text-sm font-medium text-gray-700">Jours de la semaine</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDayOfWeek(day)}
                          className={`
                            px-3 py-1 rounded-full text-sm font-medium 
                            ${daysOfWeek.includes(day) 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }
                          `}
                        >
                          {format(new Date(2023, 0, day === 0 ? 7 : day), 'EEEE', { locale: fr })}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="mr-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Ajouter
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EventForm;