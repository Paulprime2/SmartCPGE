import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { parseISO, format, isToday, isTomorrow, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  BookOpen, 
  Check, 
  Clock, 
  BarChart3,
  PlusCircle
} from 'lucide-react';
import UpcomingEvents from './UpcomingEvents';
import WorkloadChart from './WorkloadChart';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { 
    events, 
    assignments, 
    studySessions,
    workloadData,
    generateStudyPlan
  } = useAppContext();
  
  // Get today's date
  const today = new Date();
  
  // Filter for today's events and study sessions
  const todayEvents = events.filter(
    event => isToday(parseISO(event.startTime))
  );
  
  const todayStudySessions = studySessions.filter(
    session => isToday(parseISO(session.startTime)) && !session.isCompleted
  );
  
  // Upcoming assignments (due in the next 7 days)
  const upcomingAssignments = assignments
    .filter(assignment => 
      assignment.status !== 'completed' && 
      parseISO(assignment.dueDate) <= addDays(today, 7)
    )
    .sort((a, b) => 
      parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime()
    );
  
  // Today's schedule combined and sorted
  const todaySchedule = [
    ...todayEvents.map(event => ({
      id: event.id,
      title: event.title,
      time: event.startTime,
      type: event.type,
      subjectId: event.subjectId
    })),
    ...todayStudySessions.map(session => ({
      id: session.id,
      title: session.title,
      time: session.startTime,
      type: 'study',
      subjectId: session.subjectId
    }))
  ].sort((a, b) => 
    parseISO(a.time).getTime() - parseISO(b.time).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {format(today, 'EEEE d MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={generateStudyPlan}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
            Générer un plan d'étude
          </motion.button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Upcoming events card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Événements à venir
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {events.filter(e => parseISO(e.startTime) >= today).length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <UpcomingEvents />
          </div>
        </div>
        
        {/* Pending assignments card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-pink-100 rounded-md p-3">
                <BookOpen className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Devoirs en attente
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {assignments.filter(a => a.status !== 'completed').length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="space-y-2">
              {upcomingAssignments.length > 0 ? (
                upcomingAssignments.slice(0, 3).map(assignment => (
                  <div 
                    key={assignment.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div 
                        className={`w-2 h-2 rounded-full mr-2 ${
                          assignment.priority === 'high' 
                            ? 'bg-red-500' 
                            : assignment.priority === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                      />
                      <span className="text-sm text-gray-700 truncate max-w-xs">
                        {assignment.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {isToday(parseISO(assignment.dueDate)) 
                        ? 'Aujourd\'hui' 
                        : isTomorrow(parseISO(assignment.dueDate))
                        ? 'Demain'
                        : format(parseISO(assignment.dueDate), 'dd/MM')
                      }
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  Aucun devoir à venir
                </p>
              )}
              {upcomingAssignments.length > 3 && (
                <p className="text-xs text-indigo-600 font-medium text-center pt-1">
                  + {upcomingAssignments.length - 3} autres devoirs
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Study sessions card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-cyan-100 rounded-md p-3">
                <Clock className="h-6 w-6 text-cyan-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Sessions de révision planifiées
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {studySessions.filter(s => !s.isCompleted && parseISO(s.startTime) >= today).length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="space-y-2">
              {todayStudySessions.length > 0 ? (
                todayStudySessions.slice(0, 3).map(session => (
                  <div 
                    key={session.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div 
                        className={`w-2 h-2 rounded-full mr-2 ${
                          session.priority === 'high' 
                            ? 'bg-red-500' 
                            : session.priority === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                      />
                      <span className="text-sm text-gray-700 truncate max-w-xs">
                        {session.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(parseISO(session.startTime), 'HH:mm')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  Aucune session de révision aujourd'hui
                </p>
              )}
              {todayStudySessions.length > 3 && (
                <p className="text-xs text-indigo-600 font-medium text-center pt-1">
                  + {todayStudySessions.length - 3} autres sessions aujourd'hui
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Today's schedule */}
        <div className="bg-white shadow rounded-lg lg:col-span-2">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Programme d'aujourd'hui
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {todaySchedule.length > 0 ? (
              <div className="flow-root">
                <ul className="-mb-8">
                  {todaySchedule.map((item, itemIdx) => (
                    <li key={item.id}>
                      <div className="relative pb-8">
                        {itemIdx !== todaySchedule.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full flex items-center justify-center bg-indigo-100">
                              {item.type === 'course' && (
                                <BookOpen className="h-5 w-5 text-indigo-600" />
                              )}
                              {item.type === 'study' && (
                                <Clock className="h-5 w-5 text-cyan-600" />
                              )}
                              {(item.type === 'ds' || item.type === 'kholle') && (
                                <BarChart3 className="h-5 w-5 text-pink-600" />
                              )}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 flex justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-900">
                                {item.title}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {format(parseISO(item.time), 'HH:mm')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-12">
                <Check className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Rien à faire aujourd'hui</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Profitez de cette journée pour vous reposer ou prendre de l'avance !
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Workload chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Charge de travail
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <WorkloadChart workloadData={workloadData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;