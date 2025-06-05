import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { parseISO, format, isToday, isTomorrow, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const UpcomingEvents: React.FC = () => {
  const { events, subjects } = useAppContext();
  const today = new Date();
  
  // Get events for the next 7 days
  const upcomingEvents = events
    .filter(event => 
      parseISO(event.startTime) >= today && 
      parseISO(event.startTime) <= addDays(today, 7)
    )
    .sort((a, b) => 
      parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
    );
  
  const getEventDate = (date: string): string => {
    const parsedDate = parseISO(date);
    if (isToday(parsedDate)) {
      return `Aujourd'hui - ${format(parsedDate, 'HH:mm')}`;
    } else if (isTomorrow(parsedDate)) {
      return `Demain - ${format(parsedDate, 'HH:mm')}`;
    } else {
      return format(parsedDate, 'EEEE d MMM - HH:mm', { locale: fr });
    }
  };
  
  const getEventTypeLabel = (type: string): string => {
    switch (type) {
      case 'ds':
        return 'DS';
      case 'kholle':
        return 'Kholle';
      case 'dm':
        return 'DM';
      case 'course':
        return 'Cours';
      case 'study':
        return 'Révision';
      default:
        return 'Autre';
    }
  };
  
  return (
    <div className="space-y-2">
      {upcomingEvents.length > 0 ? (
        upcomingEvents.slice(0, 3).map(event => {
          const subject = subjects.find(s => s.id === event.subjectId);
          return (
            <div key={event.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: subject?.color || '#4F46E5' }}
                />
                <span className="text-sm text-gray-700 truncate max-w-xs">
                  <span className="font-medium">{getEventTypeLabel(event.type)}</span>: {event.title}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {getEventDate(event.startTime)}
              </span>
            </div>
          );
        })
      ) : (
        <p className="text-sm text-gray-500 text-center py-2">
          Aucun événement à venir
        </p>
      )}
      {upcomingEvents.length > 3 && (
        <p className="text-xs text-indigo-600 font-medium text-center pt-1">
          + {upcomingEvents.length - 3} autres événements
        </p>
      )}
    </div>
  );
};

export default UpcomingEvents;